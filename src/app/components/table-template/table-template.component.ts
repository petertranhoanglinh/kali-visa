// table-template.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { TableConfig } from 'src/app/model/table-config';

@Component({
  selector: 'app-table-template',
  templateUrl: './table-template.component.html',
  styleUrls: ['./table-template.component.css']
})
export class TableTemplateComponent implements OnInit {
  @Input() tableConfig: TableConfig = {} as TableConfig;
  @Input() data: any = [];
  @Input() isPaging: boolean = false;
  @Input() total: number = 0;
  @Input() isChangePageSize = true;
  @Input() showActions = true; // Thêm input control hiển thị cột actions

  @Input() page: number = 0;
  @Input() len: number = 10;
  @Output() handelChangePage = new EventEmitter<PageEvent>();

  @Output() clickRow = new EventEmitter<any>();
  @Output() onEdit = new EventEmitter<any>(); // Thêm event cho edit
  @Output() onDelete = new EventEmitter<any>(); // Thêm event cho delete

  constructor() { }

  ngOnInit(): void {
  }

  clickRowItem(item: any) {
    this.clickRow.emit(item);
  }

  handlePageEvent(page: PageEvent) {
    this.handelChangePage.emit(page);
  }

  editItem(event: Event, item: any) {
    event.stopPropagation(); // Ngăn sự kiện click row
    this.onEdit.emit(item);
  }

  deleteItem(event: Event, item: any) {
    event.stopPropagation(); // Ngăn sự kiện click row
    this.onDelete.emit(item);
  }
}
