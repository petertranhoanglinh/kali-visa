import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { SocialService } from 'src/app/service/social.service';
import { AuthService } from 'src/app/service/auth.service';
import { PostModel, CommentModel } from 'src/app/model/social.model';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { CommonUtils } from 'src/app/common/util/common-utils';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component({
  selector: 'app-social-feed',
  templateUrl: './social-feed.component.html',
  styleUrls: ['./social-feed.component.css']
})
export class SocialFeedComponent implements OnInit {

  @ViewChild('avatarInput') avatarInput!: ElementRef;
  currentUserProfile: any = null;

  public Editor: any = (DecoupledEditor as any).default || DecoupledEditor;
  posts: PostModel[] = [];
  isPremium: boolean = false;
  highlightedPostId: string | null = null;
  isSinglePostMode: boolean = false;

  onReady(editor: any): void {
    const toolbarElement = editor.ui.view.toolbar.element;
    const editableElement = editor.ui.getEditableElement();

    // Thêm toolbar vào DOM (Decoupled layout)
    editableElement.parentElement.insertBefore(toolbarElement, editableElement);
  }
  
  // Pagination
  currentPage: number = 0;
  pageSize: number = 10;
  isLoadingPosts: boolean = false;
  hasMorePosts: boolean = true;
  filterMode: 'ALL' | 'MINE' = 'ALL';
  
  // Post Creator
  newPostContent: string = '';
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  previewType: 'IMAGE' | 'VIDEO' | 'NONE' = 'NONE';
  isUploading: boolean = false;

  currentUserId: string = '';
  currentUserName: string = 'Nhà Đầu Tư ẩn danh';

  // Edit Mode
  editingPostId: string | null = null;
  editingPostContent: string = '';

  // Comments
  newCommentContent: { [postId: string]: string } = {};

  constructor(
    private socialService: SocialService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = AuthDetail.getLoginedInfo();
    this.isPremium = CommonUtils.checkPremiumStatus(user);
    if (user) {
      this.currentUserId = user.id;
      this.currentUserName = user.email || 'Nhà Đầu Tư ẩn danh';
      
      const jwt = user.jwt || localStorage.getItem('jwt');
      if (jwt) {
        this.authService.getProfile(jwt).subscribe({
          next: (res) => {
            if (res && res.code === 200 && res.data) {
              this.currentUserProfile = res.data;
              if (res.data.firstName || res.data.lastName) {
                this.currentUserName = `${res.data.firstName || ''} ${res.data.lastName || ''}`.trim() || this.currentUserName;
              }
            }
          }
        });
      }
    }

    // Handle Shared Post if present in URL
    this.route.queryParamMap.subscribe(params => {
      const postId = params.get('post');
      if (postId) {
        this.highlightedPostId = postId;
        this.isSinglePostMode = true; // Enter single post mode
        this.posts = []; // Clear existing for focused view
        this.socialService.getPostById(postId).subscribe({
          next: (post) => {
            post.isExpanded = true;
            post.showComments = true;
            this.posts = [post];
          },
          error: () => {
            this.toastr.error("Không tìm thấy bài viết này.");
            this.backToFeed();
          }
        });
      } else {
        this.isSinglePostMode = false;
        this.loadFeed(true);
      }
    });
  }

  backToFeed() {
    this.isSinglePostMode = false;
    this.highlightedPostId = null;
    this.posts = [];
    this.router.navigate(['/social'], { queryParams: { post: null }, queryParamsHandling: 'merge' });
  }

  setFilterMode(mode: 'ALL' | 'MINE') {
    if (this.filterMode === mode) return;
    this.filterMode = mode;
    if (this.filterMode === 'MINE' && !this.currentUserId) {
      this.toastr.warning("Vui lòng đăng nhập để xem bài gốc của bạn.");
      this.filterMode = 'ALL';
      return;
    }
    this.loadFeed(true);
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.isLoadingPosts || !this.hasMorePosts) return;
    
    // Check if scrolled near bottom (e.g. within 200px of bottom)
    const scrolledPosition = window.innerHeight + window.scrollY;
    const bodyHeight = document.body.offsetHeight;
    if (scrolledPosition >= bodyHeight - 200) {
      this.loadFeed(false);
    }
  }

  loadFeed(isFirstLoad: boolean = false) {
    if (isFirstLoad) {
      this.currentPage = 0;
      this.posts = [];
      this.hasMorePosts = true;
    }
    
    if (this.isLoadingPosts || !this.hasMorePosts) return;
    
    this.isLoadingPosts = true;

    const queryAuthorId = this.filterMode === 'MINE' ? this.currentUserId : undefined;

    this.socialService.getAllPosts(this.currentPage, this.pageSize, queryAuthorId).subscribe({
      next: (res: any) => {
        let newPosts: PostModel[] = res.content || [];
        
        // Filter out the highlighted post to avoid duplicates
        if (this.highlightedPostId) {
          newPosts = newPosts.filter(p => p.id !== this.highlightedPostId);
        }

        this.posts = [...this.posts, ...newPosts];
        this.hasMorePosts = !res.last; // Spring Data Page returns 'last' boolean flag
        
        // --- PRO Limit: Max 10 posts for Non-PRO ---
        if (!this.isPremium && this.posts.length >= 10) {
          this.hasMorePosts = false;
        }

        this.currentPage++;
        this.isLoadingPosts = false;
      },
      error: () => {
        this.toastr.error("Lỗi khi tải bảng tin!");
        this.isLoadingPosts = false;
      }
    });
  }

  get currentUserAvatar(): string {
    return this.currentUserProfile?.avatarUrl || 'https://www.redditstatic.com/avatars/avatar_default_02_A5A4A4.png';
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

  triggerAvatarUpload() {
    if (this.avatarInput) {
      this.avatarInput.nativeElement.click();
    }
  }

  onAvatarSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.toastr.warning('Ảnh đại diện không được lớn hơn 10MB');
        return;
      }
      this.isUploading = true;
      this.socialService.uploadFile(file).subscribe({
        next: (res) => {
          if (!this.currentUserProfile) {
            this.currentUserProfile = {
              firstName: '',
              lastName: '',
              avatarUrl: res.url
            };
          } else {
            this.currentUserProfile.avatarUrl = res.url;
          }
          
          const jwt = AuthDetail.getLoginedInfo()?.jwt || localStorage.getItem('jwt');
          if (jwt) {
            this.authService.updateProfile(this.currentUserProfile, jwt).subscribe({
              next: (profileRes) => {
                if (profileRes && profileRes.code === 200) {
                  this.toastr.success('Cập nhật ảnh đại diện thành công!');
                  this.loadFeed(true);
                } else {
                  this.toastr.error('Lỗi khi cập nhật ảnh đại diện vào tài khoản.');
                }
                this.isUploading = false;
              },
              error: () => {
                this.toastr.error('Lỗi kết nối khi lưu ảnh đại diện.');
                this.isUploading = false;
              }
            });
          } else {
            this.toastr.warning('Vui lòng đăng nhập để lưu ảnh đại diện.');
            this.isUploading = false;
          }
        },
        error: (err) => {
          this.toastr.error('Lỗi tải ảnh đại diện: ' + (err.error?.error || 'Unknown'));
          this.isUploading = false;
        }
      });
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        this.toastr.warning("File quá lớn (Tối đa 100MB)");
        return;
      }
      this.selectedFile = file;
      
      // Determine type for preview
      if (file.type.startsWith('image/')) {
        this.previewType = 'IMAGE';
      } else if (file.type.startsWith('video/')) {
        this.previewType = 'VIDEO';
      } else {
        this.previewType = 'NONE';
        this.toastr.warning("Chỉ hỗ trợ hình ảnh hoặc video");
        this.selectedFile = null;
        return;
      }

      // Generate preview
      const reader = new FileReader();
      reader.onload = e => this.previewUrl = reader.result;
      reader.readAsDataURL(file);
    }
  }

  clearFile() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.previewType = 'NONE';
  }

  submitPost() {
    if (!this.newPostContent.trim() && !this.selectedFile) {
      this.toastr.warning("Vui lòng nhập nội dung hoặc đính kèm ảnh/video.");
      return;
    }

    if (!this.currentUserId) {
      this.toastr.error("Vui lòng đăng nhập để đăng bài.");
      return;
    }

    this.isUploading = true;

    if (this.selectedFile) {
      this.socialService.uploadFile(this.selectedFile).subscribe({
        next: (res) => {
          this.createPostCall(res.url, res.type as any);
        },
        error: (err) => {
          this.toastr.error("Lỗi upload file: " + (err.error?.error || 'Unknown'));
          this.isUploading = false;
        }
      });
    } else {
      this.createPostCall('', 'NONE');
    }
  }

  private createPostCall(mediaUrl: string, mediaType: 'IMAGE'|'VIDEO'|'NONE') {
    const post: PostModel = {
      authorId: this.currentUserId,
      authorName: this.currentUserName,
      content: this.newPostContent,
      mediaUrl: mediaUrl,
      mediaType: mediaType,
      likes: []
    };

    this.socialService.createPost(post).subscribe({
      next: (res) => {
        this.toastr.success("Đã đăng bài thành công!");
        this.newPostContent = '';
        this.clearFile();
        this.isUploading = false;
        this.loadFeed(); // Reload to get new post at top
      },
      error: () => {
        this.toastr.error("Lỗi khi đăng bài!");
        this.isUploading = false;
      }
    });
  }

  toggleExpand(post: PostModel) {
    post.isExpanded = !post.isExpanded;
  }

  sharePost(post: PostModel) {
    const postUrl = `${window.location.origin}/social?post=${post.id}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      this.toastr.info("Đã sao chép link chia sẻ bài viết!");
    }).catch(err => {
      this.toastr.error("Không thể sao chép link.");
    });
  }

  deletePost(post: PostModel) {
    if (confirm('Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.')) {
      this.socialService.deletePost(post.id!, this.currentUserId).subscribe({
        next: () => {
          this.toastr.success("Đã xóa bài viết.");
          // Remove locally without reloading
          this.posts = this.posts.filter(p => p.id !== post.id);
        },
        error: () => this.toastr.error("Lỗi khi xóa bài viết.")
      });
    }
  }

  startEdit(post: PostModel) {
    this.editingPostId = post.id!;
    this.editingPostContent = post.content || '';
  }

  cancelEdit() {
    this.editingPostId = null;
    this.editingPostContent = '';
  }

  saveEdit(post: PostModel) {
    if (!this.editingPostContent.trim()) {
      this.toastr.warning("Nội dung không được để trống.");
      return;
    }

    const updatedPost = { ...post, content: this.editingPostContent };
    this.socialService.updatePost(post.id!, updatedPost, this.currentUserId).subscribe({
      next: (res) => {
        post.content = res.content; // Cập nhật nội dung tại chỗ
        this.toastr.success("Đã cập nhật bài viết.");
        this.cancelEdit();
      },
      error: () => this.toastr.error("Lỗi khi cập nhật bài viết.")
    });
  }

  toggleLike(post: PostModel) {
    if (!this.currentUserId) return;
    
    // Optimistic UI update
    const hasLiked = post.likes?.includes(this.currentUserId);
    if (hasLiked) {
      post.likes = post.likes?.filter(id => id !== this.currentUserId) || [];
    } else {
      if (!post.likes) post.likes = [];
      post.likes.push(this.currentUserId);
    }

    this.socialService.toggleLike(post.id!, this.currentUserId).subscribe({
      next: (res) => {
        post.likes = res.likes; // Sync with server
      },
      error: () => {
        // Revert on error
        this.loadFeed();
      }
    });
  }

  hasLiked(post: PostModel): boolean {
    return post.likes ? post.likes.includes(this.currentUserId) : false;
  }

  toggleComments(post: PostModel) {
    post.showComments = !post.showComments;
    if (post.showComments && !post.comments) {
      this.socialService.getComments(post.id!).subscribe(res => {
        post.comments = res;
      });
    }
  }

  submitComment(post: PostModel) {
    const txt = this.newCommentContent[post.id!]?.trim();
    if (!txt) return;

    if (!this.currentUserId) {
      this.toastr.error("Cần đăng nhập để bình luận.");
      return;
    }

    const comment: CommentModel = {
      postId: post.id!,
      authorId: this.currentUserId,
      authorName: this.currentUserName,
      content: txt
    };

    this.socialService.addComment(post.id!, comment).subscribe({
      next: (res) => {
        if (!post.comments) post.comments = [];
        post.comments.push(res);
        this.newCommentContent[post.id!] = '';
      },
      error: () => this.toastr.error("Không thể thêm bình luận!")
    });
  }
}
