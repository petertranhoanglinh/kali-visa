import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthDetail } from '../common/util/auth-detail';
import { DateUtils } from '../common/util/date.util';

@Injectable()
export class Interceptors implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {

        if (error.status === 403) {
          // Nếu lỗi là 403, chuyển hướng tới trang đăng nhập
          if(Number(AuthDetail.getLoginedInfo()?.logoutDate) <= Number(DateUtils.getCurrFullDateTimeStrBlank(new Date()))){
            this.router.navigate(['/login']);
          }
        }
        return throwError(error);
      })
    );
  }
}
