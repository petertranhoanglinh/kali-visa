import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookService } from '../../service/book.service';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-admin-books',
  templateUrl: './admin-books.component.html',
  styleUrls: ['./admin-books.component.css']
})
export class AdminBooksComponent implements OnInit, OnDestroy {
  books: any[] = [];
  loading: boolean = false;
  uploading: boolean = false;
  
  // Form fields
  selectedFile: File | null = null;
  title: string = '';
  author: string = '';
  description: string = '';
  parser: string = 'python';
  
  // UI Status
  errorMessage: string = '';
  successMessage: string = '';

  private pollSub?: Subscription;

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadBooks(): void {
    this.loading = true;
    this.bookService.adminGetAllBooks().subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.code === 200) {
          this.books = res.data || [];
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Không thể tải danh sách sách: ' + (err.error?.msg || err.message);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        this.errorMessage = 'Chỉ chấp nhận file định dạng PDF.';
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
      this.errorMessage = '';
      
      // Auto-fill title from filename if empty
      if (!this.title) {
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
        this.title = nameWithoutExt.replace(/[-_]/g, ' ');
      }
    }
  }

  uploadBook(): void {
    if (!this.selectedFile || !this.title || !this.author) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin và chọn file PDF.';
      return;
    }

    this.uploading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.bookService.adminUploadBook(
      this.selectedFile,
      this.title,
      this.author,
      this.description,
      this.parser
    ).subscribe({
      next: (res) => {
        this.uploading = false;
        if (res && res.code === 200) {
          this.successMessage = 'Đã tải lên thành công! Sách đang được Python OCR xử lý cấu trúc...';
          this.resetForm();
          this.loadBooks();
          this.startPolling();
        } else {
          this.errorMessage = res.msg || 'Tải lên thất bại';
        }
      },
      error: (err) => {
        this.uploading = false;
        this.errorMessage = 'Lỗi tải sách lên: ' + (err.error?.msg || err.message);
      }
    });
  }

  deleteBook(id: string): void {
    if (confirm('Bạn có chắc chắn muốn xóa cuốn sách này và toàn bộ dữ liệu cấu trúc trang không?')) {
      this.bookService.adminDeleteBook(id).subscribe({
        next: (res) => {
          if (res && res.code === 200) {
            this.successMessage = 'Đã xóa sách thành công.';
            this.loadBooks();
          } else {
            this.errorMessage = res.msg || 'Xóa thất bại';
          }
        },
        error: (err) => {
          this.errorMessage = 'Lỗi xóa sách: ' + (err.error?.msg || err.message);
        }
      });
    }
  }

  resetForm(): void {
    this.selectedFile = null;
    this.title = '';
    this.author = '';
    this.description = '';
    this.parser = 'python';
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  startPolling(): void {
    this.stopPolling();
    
    // Poll every 5 seconds
    this.pollSub = interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.bookService.adminGetAllBooks())
      )
      .subscribe({
        next: (res) => {
          if (res && res.code === 200) {
            this.books = res.data || [];
            
            // Check if any books are still processing
            const hasProcessing = this.books.some(
              b => b.status === 'PROCESSING' || b.status === 'PENDING'
            );
            
            // If no books are processing, stop polling to save resources
            if (!hasProcessing) {
              this.stopPolling();
            }
          }
        },
        error: (err) => {
          console.error('Error polling books:', err);
        }
      });
  }

  stopPolling(): void {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
      this.pollSub = undefined;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'badge-completed';
      case 'PROCESSING': return 'badge-processing';
      case 'PENDING': return 'badge-pending';
      case 'FAILED': return 'badge-failed';
      default: return 'badge-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'Hoàn thành';
      case 'PROCESSING': return 'Đang xử lý OCR';
      case 'PENDING': return 'Chờ xử lý';
      case 'FAILED': return 'Lỗi';
      default: return status;
    }
  }
}
