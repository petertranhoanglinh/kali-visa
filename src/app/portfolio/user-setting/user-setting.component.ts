import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { SocialService } from 'src/app/service/social.service';

@Component({
  selector: 'app-user-setting',
  templateUrl: './user-setting.component.html',
  styleUrls: ['./user-setting.component.css']
})
export class UserSettingComponent implements OnInit {
  // User profile details
  user: any = {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    bio: '',
    avatarUrl: '',
    geminiApiKey: '',
    tier: 'BASIC'
  };

  isLoading = false;
  activeTab: 'profile' | 'api' = 'profile';
  showApiKey = false;

  // Predefined avatar selections (like Reddit avatars)
  avatars = [
    'https://www.redditstatic.com/avatars/avatar_default_01_028100.png',
    'https://www.redditstatic.com/avatars/avatar_default_02_A5A4A4.png',
    'https://www.redditstatic.com/avatars/avatar_default_03_FF4500.png',
    'https://www.redditstatic.com/avatars/avatar_default_04_FF4500.png',
    'https://www.redditstatic.com/avatars/avatar_default_05_C18D42.png',
    'https://www.redditstatic.com/avatars/avatar_default_06_FF4500.png',
    'https://www.redditstatic.com/avatars/avatar_default_07_C18D42.png',
    'https://www.redditstatic.com/avatars/avatar_default_08_D4E815.png'
  ];

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private socialService: SocialService
  ) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    const loginInfo = AuthDetail.getLoginedInfo();
    const jwt = loginInfo?.jwt || localStorage.getItem('jwt');
    if (!jwt) {
      this.toastr.error('Vui lòng đăng nhập lại');
      return;
    }

    this.isLoading = true;
    this.authService.getProfile(jwt).subscribe({
      next: (res) => {
        if (res && res.code === 200 && res.data) {
          this.user = { ...this.user, ...res.data };
          // If avatarUrl is empty, set default
          if (!this.user.avatarUrl) {
            this.user.avatarUrl = 'https://www.redditstatic.com/avatars/avatar_default_02_A5A4A4.png';
          }
        } else {
          this.toastr.error('Không thể lấy thông tin cá nhân');
        }
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Lỗi khi tải thông tin cá nhân');
        this.isLoading = false;
      }
    });
  }

  saveProfile() {
    const loginInfo = AuthDetail.getLoginedInfo();
    const jwt = loginInfo?.jwt || localStorage.getItem('jwt');
    if (!jwt) {
      this.toastr.error('Vui lòng đăng nhập');
      return;
    }

    this.isLoading = true;

    this.authService.updateProfile(this.user, jwt).subscribe({
      next: (res) => {
        if (res && res.code === 200 && res.data) {
          this.toastr.success('Cập nhật thông tin thành công!');
          // Update local loginInfo if needed
          const updatedUser = { ...loginInfo, ...res.data };
          localStorage.setItem('loginInfo', JSON.stringify(updatedUser));
        } else {
          this.toastr.error(res.msg || 'Không thể cập nhật thông tin');
        }
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Lỗi kết nối khi cập nhật thông tin');
        this.isLoading = false;
      }
    });
  }

  selectAvatar(url: string) {
    this.user.avatarUrl = url;
  }

  onAvatarSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.toastr.warning('Ảnh đại diện không được lớn hơn 10MB');
        return;
      }
      this.isLoading = true;
      this.socialService.uploadFile(file).subscribe({
        next: (res) => {
          this.user.avatarUrl = res.url;
          this.toastr.success('Tải ảnh đại diện thành công!');
          this.isLoading = false;
        },
        error: (err) => {
          this.toastr.error('Lỗi khi tải ảnh lên: ' + (err.error?.error || 'Unknown'));
          this.isLoading = false;
        }
      });
    }
  }
}
