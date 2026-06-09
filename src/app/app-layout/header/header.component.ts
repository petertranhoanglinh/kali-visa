import { PageHeading } from './../../model/page-heading';
import { Component, ElementRef, OnInit, Renderer2, HostListener, ViewChild } from '@angular/core';
import { GuardsCheckEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { getTestConnectAction } from 'src/app/actions/coin.action';
import { setPageHeading } from 'src/app/actions/header.action';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { DateUtils } from 'src/app/common/util/date.util';
import { ValidationUtil } from 'src/app/common/util/validation.util';
import { Menu } from 'src/app/model/menu.model';
import { ResultModel } from 'src/app/model/result.model';
import { AuthState, getCartNumber } from 'src/app/selectors/auth.selector';
import { CoinState, getTestConnect } from 'src/app/selectors/coin.selector';
import { HeaderState, getIsHeader } from 'src/app/selectors/header.selector';
import { CartService } from 'src/app/service/cart-service.service';
import { AuthService } from 'src/app/service/auth.service';
import { WebSocketService } from 'src/app/service/web-socket-service.service';
import { ToastrService } from 'ngx-toastr';

declare var mobileInit: any;  // Khai báo jQuery
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  // Reddit-style search and navigation state
  searchQuery = '';
  isSearchFocused = false;
  isSearchDropdownOpen = false;
  isNavDropdownOpen = false;
  filteredSuggestions: any[] = [];
  groupedSuggestions: { [key: string]: any[] } = {};
  activeSearchIndex = -1;

  unreadCount = 0;
  notifications: any[] = [];
  isNotificationDropdownOpen = false;

  @ViewChild('searchInputRef') searchInputRef!: ElementRef;

  searchItems = [
    { title: 'Tổng Quan', description: 'Xem tổng quan tài sản, lợi nhuận và biến động danh mục', route: '/dashboard', icon: 'fa-chart-pie', category: 'Tính năng chính' },
    { title: 'Danh Mục', description: 'Quản lý tài sản, thêm mới giao dịch và theo dõi số dư', route: '/assets', icon: 'fa-wallet', category: 'Tính năng chính' },
    { title: 'Tin Tức', description: 'Cập nhật tin tức thị trường và tóm tắt phân tích bằng AI', route: '/news', icon: 'fa-newspaper', category: 'Tính năng chính' },
    { title: 'Quy Tắc', description: 'Thiết lập quy tắc giao dịch và cảnh báo thị trường', route: '/rules', icon: 'fa-bolt', category: 'Tính năng chính' },
    { title: 'Cộng Đồng', description: 'Thảo luận, chia sẻ bài viết và ý tưởng đầu tư', route: '/social', icon: 'fa-globe-asia', category: 'Tính năng chính' },
    // { title: 'Phân Tích AI', description: 'Phân tích chi tiết cổ phiếu và xu hướng bằng mô hình AI', route: '/analytics', icon: 'fa-chart-line', category: 'Công cụ PRO' },
    // { title: 'Bộ Lọc Tín Hiệu', description: 'Sàng lọc tín hiệu mua/bán của nhóm cổ phiếu VN30', route: '/screener', icon: 'fa-filter', category: 'Công cụ PRO' },
    // { title: 'Chiến Lược AI', description: 'Kiểm thử hiệu suất chiến lược giao dịch tự động', route: '/backtest', icon: 'fa-history', category: 'Công cụ PRO' },
    { title: 'Ghi Chú Cá Nhân', description: 'Lưu trữ nhật ký giao dịch và bài học kinh nghiệm', route: '/notes', icon: 'fa-sticky-note', category: 'Quản lý' },
   // { title: 'Bảng Giá Nâng Cấp', description: 'Tham khảo quyền lợi và nâng cấp tài khoản PRO', route: '/pricing', icon: 'fa-gem', category: 'Tài khoản' },
    { title: 'Hồ Sơ', description: 'Cấu hình thông tin cá nhân, cập nhật avatar và quản lý AI API Keys', route: '/setting', icon: 'fa-user-cog', category: 'Tài khoản' },
    { title: 'Duyệt Nâng Cấp', description: 'Phê duyệt yêu cầu nâng cấp gói của người dùng', route: '/admin/upgrade', icon: 'fa-check-double', category: 'Quản trị' },
    { title: 'Quản Lý Tin Tức', description: 'Biên tập tin tức, bài viết phân tích thị trường', route: '/admin/news', icon: 'fa-edit', category: 'Quản trị' },
    { title: 'Quản Lý Bài Đăng', description: 'Quản trị các bài đăng của thành viên trong cộng đồng', route: '/admin/posts', icon: 'fa-comments', category: 'Quản trị' },
    { title: 'Quản Lý Người Dùng', description: 'Quản trị danh sách người dùng và phân quyền hệ thống', route: '/admin/users', icon: 'fa-users', category: 'Quản trị' },
    { title: 'Cài Đặt Hệ Thống', description: 'Cấu hình tỷ giá USD, key Gemini xoay vòng và hệ thống', route: '/admin/setting', icon: 'fa-cogs', category: 'Quản trị' }
  ];

  subMenu: any = [];
  isHeader$ = new Observable<Boolean>();
  isHeader: boolean = true;
  get isLogin(): boolean {
    const login = AuthDetail.isLogin();
    return login;
  }
  
  get isAdmin(): boolean {
    const info = AuthDetail.getLoginedInfo();
    return info && info.role === 'ADMIN';
  }
  wellcome: string = ''
  isConnect:boolean = false;
  resultConnect$ =  new Observable<ResultModel>();
  quantityCart$ = new Observable<number>();
  quantityCart :number = 0;

  isPopupOpen = false;

  // Biến để kiểm soát trạng thái mobile menu
  isMobileMenuOpen = false;
  isAdminSection = false;

  get currentUserId(): string {
    const info = AuthDetail.getLoginedInfo();
    return info ? info.id : '';
  }



  menus: Menu[] = [
  ];
  currentPath: string = '';



  constructor(private headerStore: Store<HeaderState>, private authStore: Store<AuthState>,
    private router: Router, private cartService: CartService, private renderer: Renderer2,
    private el: ElementRef,
    private coinStore: Store<CoinState>,
    private authService: AuthService,
    private chatService: WebSocketService,
    private toastr: ToastrService) {
    this.isHeader$ = this.headerStore.select(getIsHeader);
    this.resultConnect$ = this.coinStore.select(getTestConnect);
    this.quantityCart$ = this.authStore.select(getCartNumber);

    // Phát hiện vùng Admin
    this.router.events.subscribe(() => {
      this.isAdminSection = window.location.pathname.startsWith('/admin');
    });
  }
  ngOnInit(): void {

    const overlay = this.el.nativeElement.querySelector('.mobile-menu-overlay');
    if (overlay) {
      this.renderer.listen(overlay, 'click', () => {
        this.closeMobileMenu();
      });
    }
    setTimeout(() => {
      mobileInit()
    }, 500);

    const loginInfo = AuthDetail.getLoginedInfo();
    let role = String(loginInfo?.role);

    if (this.isLogin) {
      const jwt = loginInfo.jwt;
      if (jwt) {
        this.authService.checkJwt(jwt).subscribe({
          next: (isValid) => {
            if (!isValid) {
              AuthDetail.actionLogOut();
              const currentUrl = window.location.pathname;
              if (currentUrl !== '/' && currentUrl !== '/home') {
                this.router.navigate(["/login"]);
              } else {
                location.reload(); // Reload to update UI on home page
              }
            }
          },
          error: () => {
            AuthDetail.actionLogOut();
            const currentUrl = window.location.pathname;
            if (currentUrl !== '/' && currentUrl !== '/home') {
              this.router.navigate(["/login"]);
            } else {
              location.reload();
            }
          }
        });

        // Listen to live notifications via WebSocket
        this.chatService.subscribeToNotifications(this.currentUserId);
        this.chatService.getNotificationSubject().subscribe((notif: any) => {
          if (notif) {
            const exists = this.notifications.some(n => n.id === notif.id);
            if (!exists) {
              this.unreadCount++;
              this.notifications.unshift(notif);
              
              if (notif.type === 'MESSAGE') {
                this.toastr.info(notif.content, 'Tin nhắn mới', { timeOut: 4000 });
              } else if (notif.type === 'FRIEND_REQUEST') {
                this.toastr.success(notif.content, 'Lời mời kết bạn', { timeOut: 4000 });
              } else if (notif.type === 'FRIEND_ACCEPT') {
                this.toastr.success(notif.content, 'Chấp nhận kết bạn', { timeOut: 4000 });
              }
            }
          }
        });

        // Get initial unread count
        this.authService.getUnreadNotificationsCount(jwt).subscribe({
          next: (res: any) => {
            if (res && res.code === 200) {
              this.unreadCount = res.data || 0;
            }
          }
        });
      }
      this.wellcome = "Welcome back, " + (loginInfo.email || "User");
    }
    this.initMenu(window.location.pathname);
    
    this.isHeader$.subscribe(res => {
      if (ValidationUtil.isNotNullAndNotEmpty(res)) {
        this.isHeader = Boolean(res)
      } else {
        this.isHeader = true;
      }
    })
    this.quantityCart = this.cartService.getCart(String(AuthDetail.getLoginedInfo()?.id)).length;
    this.quantityCart$.subscribe(res => {
        this.quantityCart = res;
    })
  }



  findChildrenByName(menuData: any, categoryName: any) {
    for (const category of menuData) {
      if (category.name === categoryName) {
        return category.children;
      } else {
        for (const subCategory of category.children) {
          if (subCategory.name === categoryName) {
            return subCategory.children;
          }
        }
      }
    }
    return null; // Return null if the category name is not found
  }
  logOut() {
    AuthDetail.actionLogOut();
    this.router.navigate(["/login"]);
  }

  findMenuPath(route: string): string {
    let path: string[] = [];

    // Recursive function to search for the route and build the path
    const searchMenu = (menuArray: Menu[], parentLabel?: string) => {
      for (const menu of menuArray) {
        // Check if this menu matches the route
        if (menu.route === route) {
          // Add the current menu label to the path
          if (parentLabel) {
            path.push(parentLabel);  // Add parent label if exists
          }
          path.push(menu.label);
          return true;  // Found the route
        }

        // If this menu has submenus (second level)
        if (menu.items && menu.items.length > 0) {
          for (const subItem of menu.items) {
            // Check for third-level submenus inside the second-level items
            if (subItem.route === route) {
              if (parentLabel) {
                path.push(parentLabel);  // Add parent label (first-level menu)
              }
              path.push(menu.label);  // Add second-level menu label
              path.push(subItem.label);  // Add third-level menu label
              return true;
            }
            // Search recursively within the submenu
            if (subItem.items && subItem.items.length > 0) {
              if (searchMenu(subItem.items, subItem.label)) {
                path.unshift(menu.label);  // Add the second-level menu label before
                return true;
              }
            }
          }
        }
      }
      return false;  // Route not found
    };

    // Start the search with the root menus
    searchMenu(this.menus);
    return path.length ? path.join(' > ') : 'Not Found';  // Join the path with '>'
  }

  onMenuClick(menu: Menu): void {
    
    if(ValidationUtil.isNotNullAndNotEmpty(menu.route)){
      this.closeMobileMenu();

      this.currentPath = this.findMenuPath(String(menu.route));
    }
    let isShow  = menu.isShowPageHeading == undefined || menu.isShowPageHeading == false ? false : true
    const pageHeading : PageHeading = {
      chilren:this.currentPath,
      isShow: isShow ,
      menu: menu
    }
    this.headerStore.dispatch(setPageHeading({pageHeading:pageHeading}))
  }


  initMenu(url:string){
    const menus = this.menus;
    let result: Menu | undefined;

    // Hàm đệ quy để duyệt qua các menu và items
    const search = (menuArray: Menu[]): Menu | undefined => {
      for (const menu of menuArray) {
        // Kiểm tra nếu route khớp với URL
        if (menu.route === url) {
          return menu;
        }
        // Nếu có items con, duyệt đệ quy
        if (menu.items && menu.items.length > 0) {
          result = search(menu.items);
          if (result) {
            return result;
          }
        }
      }
      return undefined;
    };
    const menu = search(menus);
    this.onMenuClick(menu as Menu)


  }



  closePopup(): void {
    this.isPopupOpen = false;
  }
 // Hàm mở mobile menu
 openMobileMenu() {
  const overlay = this.el.nativeElement.querySelector('.mobile-menu-overlay');
  const menuContainer = this.el.nativeElement.querySelector('.mobile-menu-container');

  if (overlay && menuContainer) {
    this.renderer.setStyle(overlay, 'display', 'block'); // Hiển thị overlay
    this.renderer.addClass(menuContainer, 'open'); // Mở menu
    this.isMobileMenuOpen = true;
  } else {
    console.error('Không tìm thấy phần tử .mobile-menu-overlay hoặc .mobile-menu-container');
  }
}

// Hàm đóng mobile menu
closeMobileMenu() {
  const overlay = this.el.nativeElement.querySelector('.mobile-menu-overlay');
  const menuContainer = this.el.nativeElement.querySelector('.mobile-menu-container');

  if (overlay && menuContainer) {
    this.renderer.setStyle(overlay, 'display', 'none'); // Ẩn overlay
    this.renderer.removeClass(menuContainer, 'open'); // Đóng menu
    this.isMobileMenuOpen = false;
  } else {
    console.error('Không tìm thấy phần tử .mobile-menu-overlay hoặc .mobile-menu-container');
  }
}

// Phương thức để toggle class open
toggleMenu(menuItem: HTMLLIElement , menu: Menu): void {

  this.onMenuClick(menu);
  if (menuItem.classList.contains('open')) {
    this.renderer.removeClass(menuItem, 'open'); // Đóng menu
  } else {
    this.renderer.addClass(menuItem, 'open'); // Mở menu
  }
}







preventDefault(event: Event): void {
  event.preventDefault(); // Ngăn chuyển hướng
}

  // Reddit-style search and navigation helpers
  toggleNavDropdown(event: Event) {
    event.stopPropagation();
    this.isNavDropdownOpen = !this.isNavDropdownOpen;
  }

  getActiveMenuLabel(): string {
    const currentUrl = window.location.pathname;
    
    if (currentUrl.startsWith('/admin')) {
      if (currentUrl === '/admin/upgrade') return 'Duyệt Nâng Cấp';
      if (currentUrl === '/admin/news') return 'Quản Lý News';
      if (currentUrl === '/admin/posts') return 'Quản Lý Post';
      if (currentUrl === '/admin/users') return 'Quản Lý User';
      if (currentUrl === '/admin/setting') return 'Cài Đặt Hệ Thống';
      return 'Quản trị';
    }

    if (currentUrl === '/dashboard') return 'Tổng Quan';
    if (currentUrl === '/assets') return 'Danh Mục';
    if (currentUrl === '/news') return 'Tin Tức AI';
    if (currentUrl === '/rules') return 'Quy Tắc';
    if (currentUrl === '/social') return 'Cộng Đồng';
    if (currentUrl === '/analytics') return 'Phân Tích AI';
    if (currentUrl === '/screener') return 'Tín Hiệu VN30';
    if (currentUrl === '/backtest') return 'Chiến Lược AI';
    if (currentUrl === '/setting') return 'Cài Đặt Hồ Sơ';
    
    return "T'L Wealth";
  }

  getActiveMenuIcon(): string {
    const currentUrl = window.location.pathname;
    
    if (currentUrl.startsWith('/admin')) {
      if (currentUrl === '/admin/upgrade') return 'fa-check-double';
      if (currentUrl === '/admin/news') return 'fa-edit';
      if (currentUrl === '/admin/posts') return 'fa-comments';
      if (currentUrl === '/admin/users') return 'fa-users';
      if (currentUrl === '/admin/setting') return 'fa-cogs';
      return 'fa-user-shield';
    }

    if (currentUrl === '/dashboard') return 'fa-chart-pie';
    if (currentUrl === '/assets') return 'fa-wallet';
    if (currentUrl === '/news') return 'fa-newspaper';
    if (currentUrl === '/rules') return 'fa-bolt';
    if (currentUrl === '/social') return 'fa-globe-asia';
    if (currentUrl === '/analytics') return 'fa-chart-line';
    if (currentUrl === '/screener') return 'fa-filter';
    if (currentUrl === '/backtest') return 'fa-history';
    if (currentUrl === '/setting') return 'fa-user-cog';
    
    return 'fa-home';
  }

  onSearchInput(event: any) {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.filteredSuggestions = [];
      this.groupedSuggestions = {};
      this.isSearchDropdownOpen = false;
      this.activeSearchIndex = -1;
      return;
    }

    // 1. Filter local page suggestions
    const pageSuggestions = this.searchItems.filter(item => {
      if (item.category === 'Quản trị' && !this.isAdmin) {
        return false;
      }
      return (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    });

    this.filteredSuggestions = [...pageSuggestions];
    this.updateGroupedSuggestions();
    this.isSearchDropdownOpen = true;
    this.activeSearchIndex = 0;

    // 2. Fetch user suggestions asynchronously
    if (this.isLogin) {
      const jwt = localStorage.getItem('jwt') || AuthDetail.getLoginedInfo()?.jwt;
      if (jwt) {
        this.authService.searchUsers(query, jwt).subscribe({
          next: (res: any) => {
            // Verify if the search query hasn't changed in the meantime
            if (this.searchQuery.trim().toLowerCase() !== query) return;

            if (res && res.code === 200 && res.data) {
              const userSuggestions = res.data.map((u: any) => {
                const displayName = this.getDisplayNameForUser(u);
                return {
                  title: displayName,
                  description: u.username ? `@${u.username}` : u.email,
                  route: `/profile/${u.id}`,
                  icon: 'fa-user',
                  category: 'Người dùng',
                  isUser: true,
                  avatarUrl: u.avatarUrl
                };
              });
              
              // Merge pages and users
              this.filteredSuggestions = [...pageSuggestions, ...userSuggestions];
              this.updateGroupedSuggestions();
            }
          }
        });
      }
    }
  }

  getDisplayNameForUser(user: any): string {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (fullName) return fullName;
    if (user.username) {
      if (user.username.includes('@')) {
        return user.username.split('@')[0];
      }
      return user.username;
    }
    return 'Nhà Đầu Tư ẩn danh';
  }

  updateGroupedSuggestions() {
    this.groupedSuggestions = this.filteredSuggestions.reduce((groups, item) => {
      const category = item.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {} as { [key: string]: any[] });
  }

  onSearchFocus() {
    this.isSearchFocused = true;
    if (this.searchQuery.trim()) {
      this.isSearchDropdownOpen = true;
    }
  }

  onSearchBlur() {
    this.isSearchFocused = false;
    setTimeout(() => {
      if (!this.isSearchFocused) {
        this.isSearchDropdownOpen = false;
      }
    }, 200);
  }

  clearSearch() {
    this.searchQuery = '';
    this.filteredSuggestions = [];
    this.groupedSuggestions = {};
    this.isSearchDropdownOpen = false;
    this.activeSearchIndex = -1;
  }

  hoverSuggestion(item: any) {
    this.activeSearchIndex = this.filteredSuggestions.indexOf(item);
  }

  isItemActive(item: any): boolean {
    if (this.activeSearchIndex === -1) return false;
    return this.filteredSuggestions[this.activeSearchIndex] === item;
  }

  selectSuggestion(item: any) {
    this.router.navigate([item.route]);
    this.clearSearch();
  }

  onSearchKeyDown(event: KeyboardEvent) {
    if (this.filteredSuggestions.length === 0) return;
    
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeSearchIndex = (this.activeSearchIndex + 1) % this.filteredSuggestions.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeSearchIndex = (this.activeSearchIndex - 1 + this.filteredSuggestions.length) % this.filteredSuggestions.length;
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.activeSearchIndex >= 0 && this.activeSearchIndex < this.filteredSuggestions.length) {
        this.selectSuggestion(this.filteredSuggestions[this.activeSearchIndex]);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.isSearchDropdownOpen = false;
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent) {
    const isEditing = ['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName);
    if ((event.ctrlKey && event.key.toLowerCase() === 'k') || (event.key === '/' && !isEditing)) {
      event.preventDefault();
      if (this.searchInputRef) {
        this.searchInputRef.nativeElement.focus();
        this.isSearchFocused = true;
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    // Close nav dropdown if click was outside the nav dropdown container
    const navDropdown = document.querySelector('.nav-dropdown-container');
    if (navDropdown && !navDropdown.contains(target)) {
      this.isNavDropdownOpen = false;
    }

    // Close search dropdown if click was outside the header-middle area
    const headerMiddle = document.querySelector('.header-middle');
    if (headerMiddle && !headerMiddle.contains(target)) {
      this.isSearchDropdownOpen = false;
    }

    // Close notification dropdown if click was outside the notification wrapper
    const notifDropdown = document.querySelector('.notification-dropdown-wrap');
    if (notifDropdown && !notifDropdown.contains(target)) {
      this.isNotificationDropdownOpen = false;
    }
  }

  toggleNotificationDropdown(event: Event) {
    event.stopPropagation();
    this.isNotificationDropdownOpen = !this.isNotificationDropdownOpen;
    
    if (this.isNotificationDropdownOpen) {
      const jwt = localStorage.getItem('jwt') || AuthDetail.getLoginedInfo()?.jwt;
      if (jwt) {
        this.authService.getNotifications(jwt).subscribe({
          next: (res: any) => {
            if (res && res.code === 200) {
              this.notifications = res.data || [];
            }
          }
        });
      }
    }
  }

  acceptRequest(event: Event, notif: any) {
    event.stopPropagation();
    const jwt = localStorage.getItem('jwt') || AuthDetail.getLoginedInfo()?.jwt;
    if (!jwt) return;

    this.authService.acceptFriendRequest(notif.id, jwt).subscribe({
      next: (res: any) => {
        if (res && res.code === 200) {
          this.toastr.success('Đã đồng ý kết bạn!');
          notif.status = 'ACCEPTED';
          if (this.unreadCount > 0) {
            this.unreadCount--;
          }
        }
      }
    });
  }

  declineRequest(event: Event, notif: any) {
    event.stopPropagation();
    const jwt = localStorage.getItem('jwt') || AuthDetail.getLoginedInfo()?.jwt;
    if (!jwt) return;

    this.authService.declineFriendRequest(notif.id, jwt).subscribe({
      next: (res: any) => {
        if (res && res.code === 200) {
          this.toastr.info('Đã từ chối kết bạn.');
          notif.status = 'DECLINED';
          if (this.unreadCount > 0) {
            this.unreadCount--;
          }
        }
      }
    });
  }

  markAsRead(notif: any) {
    if (notif.status !== 'UNREAD') return;
    
    const jwt = localStorage.getItem('jwt') || AuthDetail.getLoginedInfo()?.jwt;
    if (!jwt) return;

    this.authService.markNotificationRead(notif.id, jwt).subscribe({
      next: (res: any) => {
        if (res && res.code === 200) {
          notif.status = 'READ';
          if (this.unreadCount > 0) {
            this.unreadCount--;
          }
        }
      }
    });
  }
}


