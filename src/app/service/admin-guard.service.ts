import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthDetail } from '../common/util/auth-detail';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(private _router: Router, private _authService: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    // 1. Kiểm tra đăng nhập cơ bản từ LocalStorage
    if (!AuthDetail.isLogin()) {
      this._router.navigate(["/login"]);
      return of(false);
    }

    const jwt = AuthDetail.getLoginedInfo()?.jwt;
    if (!jwt) {
      this._router.navigate(["/login"]);
      return of(false);
    }

    // 2. Gọi API xác thực quyền Admin từ Server
    return this._authService.getProfile(jwt).pipe(
      map(res => {
        if (res && res.code === 200 && res.data && res.data.role === 'ADMIN') {
          return true;
        } else {
          console.error("Access Denied: Not an Admin");
          this._router.navigate(["/"]);
          return false;
        }
      }),
      catchError((err) => {
        console.error("Admin verification failed", err);
        this._router.navigate(["/"]);
        return of(false);
      })
    );
  }
}
