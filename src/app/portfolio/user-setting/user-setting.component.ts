import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { SocialService } from 'src/app/service/social.service';
import { environment } from 'src/environments/environment';

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
  apiUrl = environment.apiUrl;
  isLoading = false;
  activeTab: 'profile' | 'api' | 'friends' = 'profile';
  showApiKey = false;

  // Friends management state
  friendsList: any[] = [];
  pendingReceived: any[] = [];
  pendingSent: any[] = [];

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
    this.loadFriendsData();
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
      this.socialService.uploadFile(file , "social").subscribe({
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

  loadFriendsData() {
    const loginInfo = AuthDetail.getLoginedInfo();
    const jwt = loginInfo?.jwt || localStorage.getItem('jwt');
    if (!jwt) return;

    // Load active friends list
    this.authService.getFriends(jwt).subscribe({
      next: (res: any) => {
        if (res && res.code === 200 && res.data) {
          this.friendsList = res.data;
        }
      },
      error: () => {
        this.toastr.error('Lỗi khi tải danh sách bạn bè');
      }
    });

    // Load pending received requests (from notifications)
    this.authService.getNotifications(jwt).subscribe({
      next: (res: any) => {
        if (res && res.code === 200 && res.data) {
          this.pendingReceived = res.data.filter((notif: any) => 
            notif.type === 'FRIEND_REQUEST' && notif.status === 'PENDING'
          );
        }
      },
      error: () => {
        this.toastr.error('Lỗi khi tải lời mời kết bạn đã nhận');
      }
    });

    // Load pending sent requests
    this.authService.getSentRequests(jwt).subscribe({
      next: (res: any) => {
        if (res && res.code === 200 && res.data) {
          this.pendingSent = res.data;
        }
      },
      error: () => {
        this.toastr.error('Lỗi khi tải yêu cầu kết bạn đã gửi');
      }
    });
  }

  acceptFriendRequest(notif: any) {
    const jwt = localStorage.getItem('jwt') || AuthDetail.getLoginedInfo()?.jwt;
    if (!jwt) return;

    this.authService.acceptFriendRequest(notif.id, jwt).subscribe({
      next: (res: any) => {
        if (res && res.code === 200) {
          this.toastr.success('Đã đồng ý kết bạn!');
          this.loadFriendsData();
        } else {
          this.toastr.error(res.msg || 'Không thể đồng ý kết bạn.');
        }
      },
      error: () => this.toastr.error('Lỗi khi thực hiện chấp nhận kết bạn.')
    });
  }

  declineFriendRequest(notif: any) {
    const jwt = localStorage.getItem('jwt') || AuthDetail.getLoginedInfo()?.jwt;
    if (!jwt) return;

    this.authService.declineFriendRequest(notif.id, jwt).subscribe({
      next: (res: any) => {
        if (res && res.code === 200) {
          this.toastr.info('Đã từ chối kết bạn.');
          this.loadFriendsData();
        } else {
          this.toastr.error(res.msg || 'Không thể từ chối kết bạn.');
        }
      },
      error: () => this.toastr.error('Lỗi khi thực hiện từ chối kết bạn.')
    });
  }

  cancelSentRequest(item: any) {
    const jwt = localStorage.getItem('jwt') || AuthDetail.getLoginedInfo()?.jwt;
    if (!jwt) return;

    if (confirm(`Bạn có chắc chắn muốn hủy yêu cầu kết bạn gửi tới ${item.receiverName || 'người này'}?`)) {
      this.authService.removeFriend(item.receiverId, jwt).subscribe({
        next: (res: any) => {
          if (res && res.code === 200) {
            this.toastr.info('Đã hủy yêu cầu kết bạn.');
            this.loadFriendsData();
          } else {
            this.toastr.error(res.msg || 'Không thể hủy yêu cầu kết bạn.');
          }
        },
        error: () => this.toastr.error('Lỗi khi hủy yêu cầu kết bạn.')
      });
    }
  }

  unfriend(friend: any) {
    const jwt = localStorage.getItem('jwt') || AuthDetail.getLoginedInfo()?.jwt;
    if (!jwt) return;

    const name = this.getDisplayName(friend.firstName, friend.lastName, friend.username);
    if (confirm(`Bạn có chắc chắn muốn hủy kết bạn với ${name}? Hai người sẽ không thể xem bài viết riêng tư hoặc nhắn tin cho nhau.`)) {
      this.authService.removeFriend(friend.id, jwt).subscribe({
        next: (res: any) => {
          if (res && res.code === 200) {
            this.toastr.success(`Đã hủy kết bạn với ${name}.`);
            this.loadFriendsData();
          } else {
            this.toastr.error(res.msg || 'Không thể hủy kết bạn.');
          }
        },
        error: () => this.toastr.error('Lỗi khi thực hiện hủy kết bạn.')
      });
    }
  }

  getDisplayName(firstName?: string, lastName?: string, fallbackName?: string): string {
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
    if (fullName) return fullName;
    if (fallbackName) {
      if (fallbackName.includes('@')) {
        return fallbackName.split('@')[0];
      }
      return fallbackName;
    }
    return 'Nhà Đầu Tư ẩn danh';
  }

   getFriendShareUrl(): string {
    if (!this.user || !this.user.id) return '';
    return `${window.location.origin}/profile/${this.user.id}`;
  }
  copyText(text: string, successMessage: string = 'Đã sao chép!') {
    if (!text) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.toastr.success(successMessage);
      }).catch(() => {
        this.toastr.error('Lỗi khi sao chép.');
      });
    } else {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      this.toastr.success(successMessage);
    }
  }
  copyFriendShareUrl() {
    const url = this.getFriendShareUrl();
    this.copyText(url, 'Đã sao chép liên kết kết bạn!');
  }
}
