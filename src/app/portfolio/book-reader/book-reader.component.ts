import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../service/book.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Number of neighbouring pages to preload in each direction.
 * With PRELOAD_RADIUS = 2, we preload pages [current-2, current-1, current+1, current+2].
 */
const PRELOAD_RADIUS = 2;

@Component({
  selector: 'app-book-reader',
  templateUrl: './book-reader.component.html',
  styleUrls: ['./book-reader.component.css']
})
export class BookReaderComponent implements OnInit, OnDestroy {
  bookId: string = '';
  book: any = null;
  totalPages: number = 0;
  currentPageIdx: number = 0;
  currentPage: any = null;
  loading: boolean = false;
  pageList: number[] = [];

  // ── In-memory page cache ──────────────────────────────────────────────────
  // Stores up to ~5 pages around the current position so navigation is instant.
  // Key: pageIdx  Value: fully-loaded page data
  private pageCache = new Map<number, any>();

  // Track which pages are currently being fetched to avoid duplicate requests
  private pageFetching = new Set<number>();

  // UI Preferences
  sidebarOpen: boolean = true;
  settingsOpen: boolean = false;
  theme: string = 'light'; // 'light', 'dark', 'sepia'
  fontFamily: string = 'inter'; // 'inter', 'system', 'serif'
  fontSize: number = 18; // 14px to 24px
  lastPageTurnTime: number = 0;

  // Scroll-up page turn: track the very first scroll position to detect upward-scroll from top
  private scrollAtTopLastFrame: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.bookId = params['id'];
      if (this.bookId) {
        this.loadBookDetails();
        this.loadPageCountAndInitialize();
      }
    });
  }

  ngOnDestroy(): void {
    this.pageCache.clear();
    this.pageFetching.clear();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    // Avoid page flip when typing in search boxes or inputs
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return;
    }
    
    if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
      this.nextPage();
    } else if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
      this.prevPage();
    }
  }

  loadBookDetails(): void {
    this.bookService.getBookById(this.bookId).subscribe({
      next: (res) => {
        if (res && res.code === 200) {
          this.book = res.data;
        }
      },
      error: (err) => {
        console.error('Error fetching book details:', err);
      }
    });
  }

  loadPageCountAndInitialize(): void {
    this.loading = true;
    this.bookService.getPageCount(this.bookId).subscribe({
      next: (res) => {
        if (res && res.code === 200) {
          this.totalPages = res.data || 0;
          this.pageList = Array.from({ length: this.totalPages }, (_, i) => i);
          
          // Retrieve saved page from localStorage if exists
          let initialPage = 0;
          try {
            const saved = localStorage.getItem(`book_read_page_${this.bookId}`);
            if (saved) {
              const parsed = parseInt(saved, 10);
              if (!isNaN(parsed) && parsed >= 0 && parsed < this.totalPages) {
                initialPage = parsed;
              }
            }
          } catch (e) {
            console.error('Error reading saved page progress', e);
          }
          
          this.loadPage(initialPage);
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching page count:', err);
      }
    });
  }

  // ── Core page loading with cache ──────────────────────────────────────────

  loadPage(pageIdx: number): void {
    if (pageIdx < 0 || pageIdx >= this.totalPages) return;

    this.currentPageIdx = pageIdx;

    // ── Cache hit: display immediately, no spinner ──
    if (this.pageCache.has(pageIdx)) {
      this.currentPage = this.pageCache.get(pageIdx);
      this.loading = false;

      // Save progress in localStorage
      this._saveProgress(pageIdx);

      // Scroll reading panel to top smoothly
      this._scrollPanelToTop();

      // Kick off preloading of neighbour pages (do not await)
      this._preloadNeighbours(pageIdx);
      return;
    }

    // ── Cache miss: fetch from API ──
    this.loading = true;

    this.bookService.getBookPage(this.bookId, pageIdx).subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.code === 200) {
          const pageData = res.data;

          // Sort blocks in ascending index order to maintain logical layout reading flow
          if (pageData && pageData.blocks) {
            pageData.blocks.sort((a: any, b: any) => (a.index || 0) - (b.index || 0));
          }

          // Store in cache
          this.pageCache.set(pageIdx, pageData);
          this.pageFetching.delete(pageIdx);

          // Only update the view if this is still the intended page
          if (this.currentPageIdx === pageIdx) {
            this.currentPage = pageData;
            this._saveProgress(pageIdx);
            this._scrollPanelToTop();
          }

          // Preload neighbours
          this._preloadNeighbours(pageIdx);
        }
      },
      error: (err) => {
        this.loading = false;
        this.pageFetching.delete(pageIdx);
        console.error('Error loading page ' + pageIdx, err);
      }
    });
  }

  /**
   * Preload pages within PRELOAD_RADIUS of the given index.
   * Results are stored in pageCache but not displayed.
   */
  private _preloadNeighbours(centerIdx: number): void {
    for (let offset = -PRELOAD_RADIUS; offset <= PRELOAD_RADIUS; offset++) {
      if (offset === 0) continue; // already loaded
      const targetIdx = centerIdx + offset;
      if (targetIdx < 0 || targetIdx >= this.totalPages) continue;
      if (this.pageCache.has(targetIdx) || this.pageFetching.has(targetIdx)) continue;

      this.pageFetching.add(targetIdx);
      this.bookService.getBookPage(this.bookId, targetIdx).subscribe({
        next: (res) => {
          this.pageFetching.delete(targetIdx);
          if (res && res.code === 200) {
            const pageData = res.data;
            if (pageData && pageData.blocks) {
              pageData.blocks.sort((a: any, b: any) => (a.index || 0) - (b.index || 0));
            }
            this.pageCache.set(targetIdx, pageData);

            // Prune old entries that are outside the window [current - RADIUS - 1, current + RADIUS + 1]
            this._pruneCache(this.currentPageIdx);
          }
        },
        error: () => {
          this.pageFetching.delete(targetIdx);
        }
      });
    }
  }

  /**
   * Remove cache entries that are too far from the current page to keep memory lean.
   * Keeps 2*PRELOAD_RADIUS + 1 entries max (e.g. 5 pages).
   */
  private _pruneCache(currentIdx: number): void {
    const keepRadius = PRELOAD_RADIUS + 1; // keep one extra page outside the preload window
    for (const key of Array.from(this.pageCache.keys())) {
      if (Math.abs(key - currentIdx) > keepRadius) {
        this.pageCache.delete(key);
      }
    }
  }

  private _saveProgress(pageIdx: number): void {
    try {
      localStorage.setItem(`book_read_page_${this.bookId}`, pageIdx.toString());
    } catch (e) {
      console.error('Error saving page progress', e);
    }
  }

  private _scrollPanelToTop(): void {
    const panel = document.getElementById('readingPanel');
    if (panel) {
      panel.scrollTop = 0;
      this.scrollAtTopLastFrame = true; // Reset sentinel after page flip
    }
  }

  // ── Navigation helpers ────────────────────────────────────────────────────

  nextPage(): void {
    if (this.currentPageIdx < this.totalPages - 1) {
      this.loadPage(this.currentPageIdx + 1);
    }
  }

  prevPage(): void {
    if (this.currentPageIdx > 0) {
      this.loadPage(this.currentPageIdx - 1);
    }
  }

  jumpToPage(pageIdx: number): void {
    this.loadPage(pageIdx);
  }

  // ── Scroll / Wheel event handlers ─────────────────────────────────────────

  onScroll(event: any): void {
    const element = event.target as HTMLElement;
    const scrollTop = element.scrollTop;
    const atTop = scrollTop <= 0;
    const atBottom = element.scrollHeight - scrollTop <= element.clientHeight + 10;

    if (!this.loading) {
      const now = Date.now();

      // Scroll past the bottom → next page
      if (atBottom && now - this.lastPageTurnTime > 1500) {
        this.lastPageTurnTime = now;
        this.nextPage();
        return;
      }

      // Scroll past the top → previous page
      // We trigger only when scrollTop reaches absolute 0 AND the panel was already
      // at the top in the previous scroll event (prevents accidental flip mid-page).
      if (atTop && this.scrollAtTopLastFrame && now - this.lastPageTurnTime > 1500) {
        this.lastPageTurnTime = now;
        this.prevPage();
        return;
      }
    }

    this.scrollAtTopLastFrame = element.scrollTop <= 0;
  }

  onWheel(event: WheelEvent): void {
    const element = document.getElementById('readingPanel');
    if (!element || this.loading) return;

    const isScrollable = element.scrollHeight > element.clientHeight;
    const atBottom = !isScrollable || (element.scrollHeight - element.scrollTop <= element.clientHeight + 10);
    const atTop = element.scrollTop <= 0;

    const now = Date.now();

    if (event.deltaY > 0 && atBottom) {
      // Wheel DOWN at bottom → next page
      if (now - this.lastPageTurnTime > 1500) {
        this.lastPageTurnTime = now;
        this.nextPage();
      }
    } else if (event.deltaY < 0 && atTop) {
      // Wheel UP at top → previous page
      if (now - this.lastPageTurnTime > 1500) {
        this.lastPageTurnTime = now;
        this.prevPage();
      }
    }
  }

  // ── Block rendering helpers ───────────────────────────────────────────────

  // Sanitizes the table HTML to prevent rendering issues in [innerHTML]
  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // Helper to check block type
  isTextBlock(blockType: string): boolean {
    return blockType === 'text' || blockType === 'title' || blockType === 'paragraph';
  }

  // Extract pure text from standard block lines and spans
  getBlockText(block: any): string {
    if (!block.lines) return '';
    let text = '';
    for (const line of block.lines) {
      if (line.spans) {
        for (const span of line.spans) {
          if (span.content) {
            text += span.content + ' ';
          }
        }
      }
      text += '\n';
    }
    return text.trim();
  }

  // Get table HTML from table blocks
  getTableHtml(block: any): string {
    // Check if table block has html directly
    if (block.html) return block.html;
    
    // Check inside sub-blocks (e.g. table_body)
    if (block.blocks) {
      for (const sub of block.blocks) {
        if (sub.lines) {
          for (const line of sub.lines) {
            if (line.spans) {
              for (const span of line.spans) {
                if (span.html) return span.html;
              }
            }
          }
        }
      }
    }
    return '';
  }

  // Get table or chart image path
  getBlockImagePath(block: any): string {
    if (block.image_path) return block.image_path;
    
    // Check sub-blocks
    if (block.blocks) {
      for (const sub of block.blocks) {
        if (sub.image_path) return sub.image_path;
        if (sub.lines) {
          for (const line of sub.lines) {
            if (line.spans) {
              for (const span of line.spans) {
                if (span.image_path) return span.image_path;
              }
            }
          }
        }
      }
    }
    return '';
  }

  // Get chart caption
  getChartCaption(block: any): string {
    if (block.blocks) {
      for (const sub of block.blocks) {
        if (sub.type === 'chart_caption') {
          return this.getBlockText(sub);
        }
      }
    }
    return '';
  }

  // ── UI Controllers ────────────────────────────────────────────────────────

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleSettings(): void {
    this.settingsOpen = !this.settingsOpen;
  }

  changeTheme(newTheme: string): void {
    this.theme = newTheme;
  }

  changeFont(newFont: string): void {
    this.fontFamily = newFont;
  }

  increaseFontSize(): void {
    if (this.fontSize < 24) {
      this.fontSize += 1;
    }
  }

  decreaseFontSize(): void {
    if (this.fontSize > 14) {
      this.fontSize -= 1;
    }
  }
}
