import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthDetail } from '../common/util/auth-detail';
import { AuthService } from './auth.service';
import { ConvertUtil } from '../common/util/convert.util';
import { ValidationUtil } from '../common/util/validation.util';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  isLogin:boolean = false;
  constructor(private _router: Router, private _authService: AuthService) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
      if(!ValidationUtil.isNotNullAndNotEmpty(AuthDetail.getLoginedInfo()?.jwt)){
        this._router.navigate(["/"]);
      }
      return true;
  }
}
