import { Component, OnInit } from '@angular/core';
import { BookService } from '../../service/book.service';

@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.css']
})
export class BooksComponent implements OnInit {
  books: any[] = [];
  filteredBooks: any[] = [];
  loading: boolean = false;
  searchTerm: string = '';
  errorMessage: string = '';

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.loading = true;
    this.bookService.getCompletedBooks().subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.code === 200) {
          this.books = res.data || [];
          this.applyFilter();
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Không thể tải thư viện sách: ' + (err.error?.msg || err.message);
      }
    });
  }

  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredBooks = [...this.books];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredBooks = this.books.filter(
      book => 
        book.title?.toLowerCase().includes(term) || 
        book.author?.toLowerCase().includes(term) ||
        book.description?.toLowerCase().includes(term)
    );
  }

  getCoverGradient(bookId: string): string {
    // Generate a unique beautiful HSL gradient based on bookId string hash
    let hash = 0;
    if (bookId) {
      for (let i = 0; i < bookId.length; i++) {
        hash = bookId.charCodeAt(i) + ((hash << 5) - hash);
      }
    }
    
    const h1 = Math.abs(hash) % 360;
    const h2 = (h1 + 60) % 360;
    
    // Sleek dark-mode compatible gradient colors
    return `linear-gradient(135deg, hsl(${h1}, 65%, 22%) 0%, hsl(${h2}, 75%, 12%) 100%)`;
  }
}
