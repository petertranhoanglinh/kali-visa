import { Component, OnInit } from '@angular/core';
import { Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ValidationUtil } from 'src/app/common/util/validation.util';
import { PageHeading } from 'src/app/model/page-heading';
import { getPageHeading, HeaderState } from 'src/app/selectors/header.selector';

@Component({
  selector: 'app-page-heading',
  templateUrl: './page-heading.component.html',
  styleUrls: ['./page-heading.component.css']
})
export class PageHeadingComponent implements OnInit {

  pageHeading$ = new Observable<PageHeading>();
  pageHeading:PageHeading = {} as PageHeading;
  parts : string [] = [];

  currentUrl: string = '';

  constructor(private headerStore: Store<HeaderState> , private router: Router   ) {
    this.pageHeading$ = this.headerStore.select(getPageHeading)
   }

  ngOnInit(): void {
    this.pageHeading$.subscribe(res =>{
      if(ValidationUtil.isNotNullAndNotEmpty(res.menu)){
        this.pageHeading = res;
        this.parts = this.splitString(res.chilren)
      }
    })

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        // Sự kiện bắt đầu chuyển hướng
        console.log('Navigation started:', event.url);
      }

      if (event instanceof NavigationEnd) {
        // Sự kiện kết thúc chuyển hướng
        this.currentUrl = event.url; // Lấy URL hiện tại
        console.log('Navigation ended:', event.url);
      }

      if (event instanceof NavigationCancel) {
        // Sự kiện hủy chuyển hướng
        console.log('Navigation canceled:', event.url);
      }

      if (event instanceof NavigationError) {
        // Sự kiện lỗi chuyển hướng
        console.log('Navigation error:', event.url);
      }
    });

    
  }

  splitString(inputString: string): string[] {
    if (!inputString) {
      return []; // Trả về mảng rỗng nếu chuỗi không hợp lệ
    }
    return inputString.split(' > '); // Phân tách chuỗi theo ký tự " > "
  }

}
