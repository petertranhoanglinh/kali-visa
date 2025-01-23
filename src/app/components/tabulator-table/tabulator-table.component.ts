import { Component, ElementRef, Input, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import {TabulatorFull as Tabulator} from 'tabulator-tables';

@Component({
  selector: 'app-tabulator-table',
  templateUrl: './tabulator-table.component.html',
  styleUrls: ['./tabulator-table.component.css'],
  standalone: true,

})
export class TabulatorTableComponent implements OnInit {

  @Input() tableData: any[] = [];
  @Input() columnNames: any[] = [];
  @Input() height: string = '311px';
  // list properties you want to set per implementation here...

  tab = document.createElement('div');

  constructor(private el: ElementRef, private renderer: Renderer2) {
  }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.drawTable();
  }

  private drawTable(): void {
    new Tabulator(this.tab, {
      data: this.tableData,
      reactiveData:true, //enable data reactivity
      columns: this.columnNames,
      layout: 'fitData',
      height: this.height
    });
    const tabularTable = this.el.nativeElement.querySelector('#my-tabular-table');
    this.renderer.appendChild(tabularTable, this.tab);
  }

}
