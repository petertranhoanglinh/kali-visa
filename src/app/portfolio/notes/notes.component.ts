import { Component, OnInit } from '@angular/core';
import { InvestorNoteService } from 'src/app/service/investor-note.service';
import { InvestorNoteModel } from 'src/app/model/investor-note.model';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {

  notes: InvestorNoteModel[] = [];
  
  // Note being created/edited
  newNote: InvestorNoteModel = {
    userId: '',
    title: '',
    content: '',
    noteDate: this.formatDateForInput(new Date()),
    color: '#1e293b' // Default dark color
  };

  isEditing = false;
  editingNoteId?: string;
  showCreateForm = false;

  availableColors = [
    '#1e293b', // Default dark
    '#7f1d1d', // Dark Red
    '#14532d', // Dark Green
    '#1e3a8a', // Dark Blue
    '#701a75', // Dark Purple
    '#451a03', // Dark Orange/Brown
    '#27272a'  // Dark Gray
  ];

  constructor(
    private noteService: InvestorNoteService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    const userId = AuthDetail.getLoginedInfo()?.id;
    if (userId) {
      this.noteService.getNotesByUser(userId).subscribe({
        next: (data) => {
          this.notes = data;
        },
        error: (err) => {
          this.toastr.error('Lỗi khi tải danh sách ghi chú!');
        }
      });
    }
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetForm();
    }
  }

  selectColor(color: string): void {
    this.newNote.color = color;
  }

  saveNote(): void {
    const userId = AuthDetail.getLoginedInfo()?.id;
    if (!userId) {
      this.toastr.error('Vui lòng đăng nhập lại!');
      return;
    }

    this.newNote.userId = userId;

    if (!this.newNote.title.trim() && !this.newNote.content.trim()) {
      this.toastr.warning('Vui lòng nhập tiêu đề hoặc nội dung ghi chú');
      return;
    }

    if (this.isEditing && this.editingNoteId) {
      this.noteService.updateNote(this.editingNoteId, this.newNote).subscribe({
        next: () => {
          this.toastr.success('Cập nhật ghi chú thành công!');
          this.loadNotes();
          this.resetForm();
          this.showCreateForm = false;
        },
        error: () => this.toastr.error('Lỗi khi cập nhật ghi chú!')
      });
    } else {
      this.noteService.addNote(this.newNote).subscribe({
        next: () => {
          this.toastr.success('Thêm ghi chú thành công!');
          this.loadNotes();
          this.resetForm();
          this.showCreateForm = false;
        },
        error: () => this.toastr.error('Lỗi khi thêm ghi chú!')
      });
    }
  }

  editNote(note: InvestorNoteModel): void {
    this.isEditing = true;
    this.editingNoteId = note.id;
    this.newNote = { ...note };
    
    // Ensure the date format is correct for the datetime-local input
    if (note.noteDate) {
      // If it has timezone Z, remove it or parse it properly for input
      try {
        const d = new Date(note.noteDate);
        this.newNote.noteDate = this.formatDateForInput(d);
      } catch(e) {
        // keep as is
      }
    }
    
    this.showCreateForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteNote(id?: string): void {
    if (!id) return;
    if (confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) {
      this.noteService.deleteNote(id).subscribe({
        next: () => {
          this.toastr.success('Xóa ghi chú thành công!');
          this.loadNotes();
        },
        error: () => this.toastr.error('Lỗi khi xóa ghi chú!')
      });
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.editingNoteId = undefined;
    this.newNote = {
      userId: '',
      title: '',
      content: '',
      noteDate: this.formatDateForInput(new Date()),
      color: '#1e293b'
    };
  }

  private formatDateForInput(date: Date): string {
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return date.getFullYear() + '-' +
      pad(date.getMonth() + 1) + '-' +
      pad(date.getDate()) + 'T' +
      pad(date.getHours()) + ':' +
      pad(date.getMinutes());
  }
}
