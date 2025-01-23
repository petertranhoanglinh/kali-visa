import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-paging',
  templateUrl: './paging.component.html',
  styleUrls: ['./paging.component.css']
})


export class PagingComponent implements OnInit {

  @Input() length = 50;
  @Input() pageSize = 10;
  @Input() pageIndex = 0;
  @Input() isChangePageSize = true;

  @Output() handelChangePage = new EventEmitter<PageEvent>();
  pageSizeOptions = [5, 8 , 10, 25];


  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;

  pageEvent: PageEvent = new PageEvent;
  ngOnInit(): void {

  }


  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.handelChangePage.emit(e);
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }

}
