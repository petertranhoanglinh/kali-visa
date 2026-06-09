import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { SocialService } from 'src/app/service/social.service';
import { environment } from 'src/environments/environment';

import {
  loadProfile,
  updateProfile,
  loadFriendsData,
  acceptFriendRequest,
  declineFriendRequest,
  cancelSentRequest,
  unfriend
} from 'src/app/actions/profile.actions';

import {
  selectProfileUser,
  selectIsLoadingProfile,
  selectIsUpdatingProfile,
  selectFriendsList,
  selectPendingReceived,
  selectPendingSent,
  selectIsLoadingFriends
} from 'src/app/selectors/profile.selector';

@Component({
  selector: 'app-user-setting',
  templateUrl: './user-setting.component.html',
  styleUrls: ['./user-setting.component.css']
})
export class UserSettingComponent implements OnInit, OnDestroy {
  // User profile details (local editable copy)
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
  isUpdating = false;
  activeTab: 'profile' | 'api' | 'friends' = 'profile';
  showApiKey = false;

  // Friends management state (from store)
  friendsList: any[] = [];
  pendingReceived: any[] = [];
  pendingSent: any[] = [];
  isLoadingFriends = false;

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

  private subscriptions: Subscription[] = [];

  constructor(
    private store: Store,
    private toastr: ToastrService,
    private socialService: SocialService
  ) {}

  ngOnInit(): void {
    const loginInfo = AuthDetail.getLoginedInfo();
    const jwt = loginInfo?.jwt || localStorage.getItem('jwt');

    if (!jwt) {
      this.toastr.error('Vui lòng đăng nhập lại');
      return;
    }

    // Dispatch actions to load data
    this.store.dispatch(loadProfile({ jwt }));
    this.store.dispatch(loadFriendsData({ jwt }));

    // Subscribe to profile state
    this.subscriptions.push(
      this.store.select(selectProfileUser).subscribe(storeUser => {
        if (storeUser) {
          // Sync store user into local editable copy
          this.user = { ...this.user, ...storeUser };
        }
      })
    );

    this.subscriptions.push(
      this.store.select(selectIsLoadingProfile).subscribe(loading => {
        this.isLoading = loading;
      })
    );

    this.subscriptions.push(
      this.store.select(selectIsUpdatingProfile).subscribe(updating => {
        this.isUpdating = updating;
      })
    );

    // Subscribe to friends state
    this.subscriptions.push(
      this.store.select(selectFriendsList).subscribe(list => {
        this.friendsList = list;
      })
    );

    this.subscriptions.push(
      this.store.select(selectPendingReceived).subscribe(pending => {
        this.pendingReceived = pending;
      })
    );

    this.subscriptions.push(
      this.store.select(selectPendingSent).subscribe(sent => {
        this.pendingSent = sent;
      })
    );

    this.subscriptions.push(
      this.store.select(selectIsLoadingFriends).subscribe(loading => {
        this.isLoadingFriends = loading;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  saveProfile() {
    const loginInfo = AuthDetail.getLoginedInfo();
    const jwt = loginInfo?.jwt || localStorage.getItem('jwt');
    if (!jwt) {
      this.toastr.error('Vui lòng đăng nhập');
      return;
    }
    this.store.dispatch(updateProfile({ user: this.user, jwt }));
  }

  selectAvatar(url: string) {
    this.user = { ...this.user, avatarUrl: url };
  }

  onAvatarSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.toastr.warning('Ảnh đại diện không được lớn hơn 10MB');
        return;
      }
      this.isLoading = true;
      this.socialService.uploadFile(file, 'social').subscribe({
        next: (res) => {
          this.user = { ...this.user, avatarUrl: res.url };
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

  acceptFriendRequest(notif: any) {
    const jwt = localStorage.getItem('jwt') || AuthDetail.getLoginedInfo()?.jwt;
    if (!jwt) return;
    this.store.dispatch(acceptFriendRequest({ notificationId: notif.id, jwt }));
  }

  declineFriendRequest(notif: any) {
    const jwt = localStorage.getItem('jwt') || AuthDetail.getLoginedInfo()?.jwt;
    if (!jwt) return;
    this.store.dispatch(declineFriendRequest({ notificationId: notif.id, jwt }));
  }

  cancelSentRequest(item: any) {
    const jwt = localStorage.getItem('jwt') || AuthDetail.getLoginedInfo()?.jwt;
    if (!jwt) return;

    if (confirm(`Bạn có chắc chắn muốn hủy yêu cầu kết bạn gửi tới ${item.receiverName || 'người này'}?`)) {
      this.store.dispatch(cancelSentRequest({ receiverId: item.receiverId, jwt }));
    }
  }

  unfriend(friend: any) {
    const jwt = localStorage.getItem('jwt') || AuthDetail.getLoginedInfo()?.jwt;
    if (!jwt) return;

    const name = this.getDisplayName(friend.firstName, friend.lastName, friend.username);
    if (confirm(`Bạn có chắc chắn muốn hủy kết bạn với ${name}? Hai người sẽ không thể xem bài viết riêng tư hoặc nhắn tin cho nhau.`)) {
      this.store.dispatch(unfriend({ friendId: friend.id, friendName: name, jwt }));
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
