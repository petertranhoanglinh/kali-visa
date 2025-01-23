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
  @Input() isPaging:boolean = false;
  @Input() total :number = 0;
  @Input() isChangePageSize = true;

  @Input() page:number = 0;
  @Input() len:number = 10;
  @Output() handelChangePage = new EventEmitter<PageEvent>();



  @Output() clickRow = new EventEmitter<any>();


  constructor() { }

  ngOnInit(): void {
  }

  clickRowItem(item:any){
    this.clickRow.emit(item);
  }

  handlePageEvent(page:PageEvent){
    this.handelChangePage.emit(page);
  }


}
