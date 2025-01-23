import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { setShowOverlayLoading } from 'src/app/actions/overlay-loading.action';
import { OverlayLoadingState } from 'src/app/selectors/overlay-loading.selector';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent  implements OnInit {


  constructor( private overlayLoadingStore: Store<OverlayLoadingState>){}
  ngOnInit(): void {



  }
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Input() title:string = '';


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
     if(this.isOpen){
      this.overlayLoadingStore.dispatch(setShowOverlayLoading({loading:true}));


      setTimeout(() => {
        this.overlayLoadingStore.dispatch(setShowOverlayLoading({loading:false}));
      }, 1000);
     }

    }
  }


  closePopup(): void {
    this.close.emit();
  }
}
