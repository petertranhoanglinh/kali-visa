import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { SocialService } from 'src/app/service/social.service';
import { ToastrService } from 'ngx-toastr';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { PostModel } from 'src/app/model/social.model';
import { ChatTabService } from 'src/app/service/chat-tab.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  userId: string = '';
  currentUserId: string = '';
  isSelf: boolean = false;
  isFriend: boolean = false;
  relationshipStatus: string = 'NONE';
  isLoading: boolean = false;

  targetUser: any = null;
  targetProfile: any = null; // Biography, etc.
  posts: PostModel[] = [];
  
  // Edit mode fields (only if isSelf)
  isEditing: boolean = false;
  editBio: string = '';
  editOccupation: string = '';
  editWebsite: string = '';
  editLocation: string = '';
  editAboutMe: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private socialService: SocialService,
    private chatTabService: ChatTabService,
    private toastr: ToastrService
  ) {}

  openDirectChat() {
    this.chatTabService.openTab(this.userId);
  }

  ngOnInit(): void {
    const loginInfo = AuthDetail.getLoginedInfo();
    if (loginInfo) {
      this.currentUserId = loginInfo.id;
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.userId = id;
        this.isSelf = this.currentUserId === this.userId;
        this.loadProfile();
      }
    });
  }

  loadProfile() {
    const jwt = localStorage.getItem('jwt') || AuthDetail.getLoginedInfo()?.jwt;
    if (!jwt) {
      this.toastr.error('Vui lòng đăng nhập.');
      return;
    }

    this.isLoading = true;
    this.authService.getProfileById(this.userId, jwt).subscribe({
      next: (res: any) => {
        if (res && res.code === 200 && res.data) {
          this.targetUser = res.data.user;
          this.isFriend = res.data.isFriend;
          this.relationshipStatus = res.data.relationshipStatus || 'NONE';
          this.targetProfile = res.data.profile;

          if (this.targetProfile) {
            this.editBio = this.targetProfile.bio || '';
            this.editOccupation = this.targetProfile.occupation || '';
            this.editWebsite = this.targetProfile.website || '';
            this.editLocation = this.targetProfile.location || '';
            this.editAboutMe = this.targetProfile.aboutMe || '';
          }

          // Fetch posts if self or friend
          if (this.isSelf || this.isFriend) {
            this.loadPosts();
          } else {
            this.posts = [];
          }
        } else {
          this.toastr.error('Không tìm thấy người dùng này');
        }
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Lỗi khi tải thông tin cá nhân');
        this.isLoading = false;
      }
    });
  }

  loadPosts() {
    this.socialService.getAllPosts(0, 50, this.userId).subscribe({
      next: (res: any) => {
        this.posts = res.content || [];
      }
    });
  }

  toggleFriendship() {
    const jwt = localStorage.getItem('jwt') || AuthDetail.getLoginedInfo()?.jwt;
    if (!jwt) return;

    if (this.relationshipStatus === 'FRIENDS') {
      if (confirm('Bạn có chắc chắn muốn hủy kết bạn với người này không?')) {
        this.authService.removeFriend(this.userId, jwt).subscribe({
          next: (res: any) => {
            if (res && res.code === 200) {
              this.toastr.info('Đã hủy kết bạn.');
              this.relationshipStatus = 'NONE';
              this.isFriend = false;
              this.posts = [];
            }
          }
        });
      }
    } else if (this.relationshipStatus === 'PENDING_SENT') {
      if (confirm('Bạn có muốn hủy yêu cầu kết bạn đã gửi?')) {
        this.authService.removeFriend(this.userId, jwt).subscribe({
          next: (res: any) => {
            if (res && res.code === 200) {
              this.toastr.info('Đã hủy yêu cầu kết bạn.');
              this.relationshipStatus = 'NONE';
            }
          }
        });
      }
    } else if (this.relationshipStatus === 'PENDING_RECEIVED') {
      this.authService.addFriend(this.userId, jwt).subscribe({
        next: (res: any) => {
          if (res && res.code === 200) {
            this.toastr.success('Kết bạn thành công!');
            this.relationshipStatus = 'FRIENDS';
            this.isFriend = true;
            this.loadPosts();
          }
        }
      });
    } else { // NONE
      this.authService.addFriend(this.userId, jwt).subscribe({
        next: (res: any) => {
          if (res && res.code === 200) {
            if (res.data && res.data.friendIds && res.data.friendIds.includes(this.userId)) {
              this.toastr.success('Kết bạn thành công!');
              this.relationshipStatus = 'FRIENDS';
              this.isFriend = true;
              this.loadPosts();
            } else {
              this.toastr.success('Đã gửi yêu cầu kết bạn!');
              this.relationshipStatus = 'PENDING_SENT';
            }
          }
        }
      });
    }
  }

  declineFriendRequest() {
    const jwt = localStorage.getItem('jwt') || AuthDetail.getLoginedInfo()?.jwt;
    if (!jwt) return;

    this.authService.declineFriendRequestByUser(this.userId, jwt).subscribe({
      next: (res: any) => {
        if (res && res.code === 200) {
          this.toastr.info('Đã từ chối yêu cầu kết bạn.');
          this.relationshipStatus = 'NONE';
        }
      }
    });
  }

  startEdit() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
  }

  saveProfileDetails() {
    const jwt = localStorage.getItem('jwt') || AuthDetail.getLoginedInfo()?.jwt;
    if (!jwt) return;

    const details = {
      bio: this.editBio,
      occupation: this.editOccupation,
      website: this.editWebsite,
      location: this.editLocation,
      aboutMe: this.editAboutMe
    };

    this.authService.updateProfileDetails(details, jwt).subscribe({
      next: (res: any) => {
        if (res && res.code === 200) {
          this.toastr.success('Cập nhật thông tin thành công!');
          this.targetProfile = res.data;
          this.isEditing = false;
        }
      },
      error: () => this.toastr.error('Không thể cập nhật thông tin.')
    });
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
}
