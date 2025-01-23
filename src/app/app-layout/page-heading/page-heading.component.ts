import { Component, OnInit } from '@angular/core';
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

  constructor(private headerStore: Store<HeaderState> ) {
    this.pageHeading$ = this.headerStore.select(getPageHeading)
   }

  ngOnInit(): void {
    this.pageHeading$.subscribe(res =>{
      if(ValidationUtil.isNotNullAndNotEmpty(res.menu)){
        this.pageHeading = res;
        this.parts = this.splitString(res.chilren)
      }
    })
  }

  splitString(inputString: string): string[] {
    if (!inputString) {
      return []; // Trả về mảng rỗng nếu chuỗi không hợp lệ
    }
    return inputString.split(' > '); // Phân tách chuỗi theo ký tự " > "
  }

}
