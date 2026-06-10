import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../service/book.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  
  // UI Preferences
  sidebarOpen: boolean = true;
  settingsOpen: boolean = false;
  theme: string = 'light'; // 'light', 'dark', 'sepia'
  fontFamily: string = 'inter'; // 'inter', 'system', 'serif'
  fontSize: number = 18; // 14px to 24px
  lastPageTurnTime: number = 0;

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
    // Cleanup listeners if needed
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

  loadPage(pageIdx: number): void {
    if (pageIdx < 0 || pageIdx >= this.totalPages) return;
    
    this.loading = true;
    this.currentPageIdx = pageIdx;
    
    this.bookService.getBookPage(this.bookId, pageIdx).subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.code === 200) {
          const pageData = res.data;
          
          // Sort blocks in ascending index order to maintain logical layout reading flow
          if (pageData && pageData.blocks) {
            pageData.blocks.sort((a: any, b: any) => (a.index || 0) - (b.index || 0));
          }
          
          this.currentPage = pageData;
          
          // Save progress in localStorage
          try {
            localStorage.setItem(`book_read_page_${this.bookId}`, pageIdx.toString());
          } catch (e) {
            console.error('Error saving page progress', e);
          }
          
          // Scroll reading panel to top
          const panel = document.getElementById('readingPanel');
          if (panel) panel.scrollTop = 0;
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading page ' + pageIdx, err);
      }
    });
  }

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

  // UI Controllers
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

  onScroll(event: any): void {
    const element = event.target;
    // Check if user has scrolled to the bottom of the page (within 10px threshold)
    const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
    
    if (atBottom && !this.loading) {
      const now = Date.now();
      // Throttle page transitions to prevent double-skipping (1.5 seconds cooldown)
      if (now - this.lastPageTurnTime > 1500) {
        this.lastPageTurnTime = now;
        this.nextPage();
      }
    }
  }

  onWheel(event: WheelEvent): void {
    const element = document.getElementById('readingPanel');
    if (!element || this.loading) return;

    // Detect rolling scroll wheel downwards
    if (event.deltaY > 0) {
      const isScrollable = element.scrollHeight > element.clientHeight;
      // Triggers if container is not scrollable (short page) or already at bottom
      const atBottom = !isScrollable || (element.scrollHeight - element.scrollTop <= element.clientHeight + 10);

      if (atBottom) {
        const now = Date.now();
        if (now - this.lastPageTurnTime > 1500) {
          this.lastPageTurnTime = now;
          this.nextPage();
        }
      }
    }
  }
}
