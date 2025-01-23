import { Injectable, NgZone } from "@angular/core";
import { Router } from "@angular/router";
import { AuthDetail } from "../common/util/auth-detail";
import { DateUtils } from "../common/util/date.util";


@Injectable({
    providedIn: 'root'
  })
export class AutologoutService {
    constructor(
        private _router: Router,
        private ngZone: NgZone
    ) {
      this.initListener();
      this.initInterval();
    }

   /**
   * time interval
   */
  initInterval() {
    this.ngZone.runOutsideAngular(() => {
      setInterval(() => {
          if(Number(AuthDetail.getLoginedInfo()?.logoutDate) <= Number(DateUtils.getCurrFullDateTimeStrBlank(new Date()))){
            AuthDetail.actionLogOut();
            window.location.href = '/';
          }
      }, 1000*60*30);
    })
  }


   /**
   * start event listener
   */
  initListener() {
    this.ngZone.runOutsideAngular(() => {
      document.body.addEventListener('click', () => this.reset());
      document.body.addEventListener('keydown',() => this.reset());
      document.body.addEventListener('keyup',() => this.reset());
      document.body.addEventListener('keypress',() => this.reset());
    });
  }

  /**
   * reset timer
   */
   reset() {
    this.lastAction(Date.now());
  }

   /**
   * last action
   */
   getLastAction() {
    return localStorage.getItem('lastAction');
   }



   /**
   * set last action
   * @param value
   */
  lastAction(value: any) {
    localStorage.setItem('lastAction', JSON.stringify(value))
  }

}
