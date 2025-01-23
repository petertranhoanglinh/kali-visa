import { Component, OnInit } from '@angular/core';
import { HttpService } from '../service/http.service';
import { TableConfig } from '../model/table-config';
import { OverlayLoadingState, getLoading } from '../selectors/overlay-loading.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-app-layout',
  host: { class: '' },
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css']
})
export class AppLayoutComponent implements OnInit {

  show$ = new Observable<boolean> ;
  show:boolean = false;

  constructor(private http:HttpService    , private overlayLoadingStore: Store<OverlayLoadingState>) {

    this.show$ = this.overlayLoadingStore.select(getLoading);
    

  }

  ngOnInit(): void {
    this.show$.subscribe(res =>{
      this.show = res;
    })
  }

  

}
