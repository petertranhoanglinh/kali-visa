import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { MemberModel } from 'src/app/model/member.model';
import { AuthDetail } from 'src/app/common/util/auth-detail';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: MemberModel[] = [];
  filteredUsers: MemberModel[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  jwt: string = '';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    const loginInfo = AuthDetail.getLoginedInfo();
    this.jwt = loginInfo.jwt;
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.authService.getUsersAdmin(this.jwt).subscribe({
      next: (res) => {
        this.users = res;
        this.applyFilter();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilter() {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(u => 
        (u.username && u.username.toLowerCase().includes(term)) || 
        (u.email && u.email.toLowerCase().includes(term)) ||
        (u.id && u.id.toLowerCase().includes(term))
      );
    }
  }

  updateUser(user: MemberModel) {
    if (!user.id) return;
    this.loading = true;
    this.authService.updateUserAdmin(user.id, user, this.jwt).subscribe({
      next: () => {
        alert('Cập nhật người dùng thành công!');
        this.loading = false;
      },
      error: (err) => {
        alert('Lỗi: ' + (err.error?.msg || 'Không thể cập nhật người dùng'));
        this.loading = false;
      }
    });
  }
}
