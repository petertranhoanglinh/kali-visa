import { PageHeading } from './../../model/page-heading';
import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
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

declare var mobileInit: any;  // Khai báo jQuery
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  subMenu: any = [];
  isHeader$ = new Observable<Boolean>();
  isHeader: boolean = true;
  isLogin: boolean = AuthDetail.isLogin();
  wellcome: string = ''
  isConnect:boolean = false;
  resultConnect$ =  new Observable<ResultModel>();
  quantityCart$ = new Observable<number>();
  quantityCart :number = 0;

  isPopupOpen = false;

  // Biến để kiểm soát trạng thái mobile menu
  isMobileMenuOpen = false;



  menus: Menu[] = [


    {
      label: 'Dịch Vụ Visa',
      route:"/shopping/product-list"
    },
    {
      label:'Bài Viết',
      route:'/blog/blogs',
    }
    ,
    {
      label: 'Giới Thiệu', route: '/about/about-story'

    },

    {
      label:'Liên Hệ',
      route:'/about/contact',
    },
  ];
  currentPath: string = '';



  constructor(private headerStore: Store<HeaderState>,private authStore: Store<AuthState>,
    private router: Router, private cartService: CartService,private renderer: Renderer2,
    private el: ElementRef ,
    private coinStore: Store<CoinState>) {
    this.isHeader$ = this.headerStore.select(getIsHeader);
    this.resultConnect$ = this.coinStore.select(getTestConnect);
    this.quantityCart$ = this.authStore.select(getCartNumber)
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
    let role  = String(AuthDetail.getLoginedInfo()?.role);

    if(this.isLogin){
      this.menus.push(
      {
        label:'Wishlist',
        route:'/shopping/wishlist',
        kind:'mt',
        icon:'icon-heart-o'
      },
      {
        label:'View Cart',
        route:'/shopping/cart',
        kind:'mt'
      },
      {
        label:'Checkout',
        route:'/shopping/checkout',
        kind:'mt'
      },
      {
        label:'Account',
        route:'/auth/my-account',
        kind:'mt',
        icon:'icon-user'
      },

    )
    }


    if(role == 'admin'){
      this.menus.push({
        label: 'Administrator',
        items: [
          {label : "Quản Lý Dịch Vụ" , route: '/shopping/newProduct' },
          {label : "Đăng Ký Danh Mục Dịch Vụ " , route: '/product/regcate'},
          {label: 'Theo Dõi Đơn Hàng Dịch Vụ', route: '/shopping/order-tracking' },
          {label: 'Chi Tiết Dịch Vụ', route: '/shopping/order-detail'},
          {label: 'Thêm Mới Bài Viết', route: '/blog/blog-edit'},
          {label: 'Quản Lý Bài Viết', route: '/blog/blog-admin'},
          {label: 'Quản Lý Tin Nhắn', route: '/chat-admin'},
        ]
      })
    }

    this.initMenu(window.location.pathname );


    if(Number(AuthDetail.getLoginedInfo()?.logoutDate) <= Number(DateUtils.getCurrFullDateTimeStrBlank(new Date()))){
      AuthDetail.actionLogOut();
      window.location.href = '/';
    }

    if (this.isLogin) {
     // this.coinStore.dispatch(getTestConnectAction());
      this.wellcome = "Wellcome to " + String(AuthDetail.getLoginedInfo()?.email)
    }

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
    window.location.href = "/"
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
}


