import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, forkJoin } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service';
import {
  loadProfile,
  loadProfileSuccess,
  loadProfileFailure,
  updateProfile,
  updateProfileSuccess,
  updateProfileFailure,
  loadFriendsData,
  loadFriendsDataSuccess,
  loadFriendsDataFailure,
  acceptFriendRequest,
  declineFriendRequest,
  cancelSentRequest,
  unfriend
} from '../actions/profile.actions';

@Injectable()
export class ProfileEffect {

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private toastr: ToastrService,
    private store: Store
  ) {}

  loadProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProfile),
      switchMap(({ jwt }) =>
        this.authService.getProfile(jwt).pipe(
          map((res: any) => {
            if (res && res.code === 200 && res.data) {
              const user = { ...res.data };
              if (!user.avatarUrl) {
                user.avatarUrl = 'https://www.redditstatic.com/avatars/avatar_default_02_A5A4A4.png';
              }
              return loadProfileSuccess({ user });
            } else {
              return loadProfileFailure({ error: res.msg || 'Không thể lấy thông tin cá nhân' });
            }
          }),
          catchError((err) => {
            return of(loadProfileFailure({ error: err.message || 'Lỗi khi tải thông tin cá nhân' }));
          })
        )
      )
    )
  );

  updateProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateProfile),
      switchMap(({ user, jwt }) =>
        this.authService.updateProfile(user, jwt).pipe(
          map((res: any) => {
            if (res && res.code === 200 && res.data) {
              this.toastr.success('Cập nhật thông tin thành công!');
              // Sync to localStorage
              const loginInfoStr = localStorage.getItem('loginInfo');
              if (loginInfoStr) {
                const loginInfo = JSON.parse(loginInfoStr);
                const updatedUser = { ...loginInfo, ...res.data };
                localStorage.setItem('loginInfo', JSON.stringify(updatedUser));
              }
              return updateProfileSuccess({ user: res.data });
            } else {
              this.toastr.error(res.msg || 'Không thể cập nhật thông tin');
              return updateProfileFailure({ error: res.msg || 'Lỗi cập nhật' });
            }
          }),
          catchError((err) => {
            this.toastr.error('Lỗi kết nối khi cập nhật thông tin');
            return of(updateProfileFailure({ error: err.message || 'Lỗi kết nối' }));
          })
        )
      )
    )
  );

  loadFriendsData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadFriendsData),
      switchMap(({ jwt }) =>
        forkJoin({
          friends: this.authService.getFriends(jwt),
          notifications: this.authService.getNotifications(jwt),
          sent: this.authService.getSentRequests(jwt)
        }).pipe(
          map(({ friends, notifications, sent }) => {
            const friendsList = friends.code === 200 ? friends.data || [] : [];
            const pendingReceived = notifications.code === 200
              ? (notifications.data || []).filter((notif: any) =>
                  notif.type === 'FRIEND_REQUEST' && notif.status === 'PENDING'
                )
              : [];
            const pendingSent = sent.code === 200 ? sent.data || [] : [];
            return loadFriendsDataSuccess({ friendsList, pendingReceived, pendingSent });
          }),
          catchError((err) => {
            return of(loadFriendsDataFailure({ error: err.message || 'Lỗi khi tải dữ liệu bạn bè' }));
          })
        )
      )
    )
  );

  acceptFriendRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(acceptFriendRequest),
      switchMap(({ notificationId, jwt }) =>
        this.authService.acceptFriendRequest(notificationId, jwt).pipe(
          map((res: any) => {
            if (res && res.code === 200) {
              this.toastr.success('Đã đồng ý kết bạn!');
              return loadFriendsData({ jwt });
            } else {
              this.toastr.error(res.msg || 'Không thể đồng ý kết bạn.');
              return { type: '[Profile] No-op' };
            }
          }),
          catchError(() => {
            this.toastr.error('Lỗi khi thực hiện chấp nhận kết bạn.');
            return of({ type: '[Profile] Action Error' });
          })
        )
      )
    )
  );

  declineFriendRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(declineFriendRequest),
      switchMap(({ notificationId, jwt }) =>
        this.authService.declineFriendRequest(notificationId, jwt).pipe(
          map((res: any) => {
            if (res && res.code === 200) {
              this.toastr.info('Đã từ chối kết bạn.');
              return loadFriendsData({ jwt });
            } else {
              this.toastr.error(res.msg || 'Không thể từ chối kết bạn.');
              return { type: '[Profile] No-op' };
            }
          }),
          catchError(() => {
            this.toastr.error('Lỗi khi thực hiện từ chối kết bạn.');
            return of({ type: '[Profile] Action Error' });
          })
        )
      )
    )
  );

  cancelSentRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(cancelSentRequest),
      switchMap(({ receiverId, jwt }) =>
        this.authService.removeFriend(receiverId, jwt).pipe(
          map((res: any) => {
            if (res && res.code === 200) {
              this.toastr.info('Đã hủy yêu cầu kết bạn.');
              return loadFriendsData({ jwt });
            } else {
              this.toastr.error(res.msg || 'Không thể hủy yêu cầu kết bạn.');
              return { type: '[Profile] No-op' };
            }
          }),
          catchError(() => {
            this.toastr.error('Lỗi khi hủy yêu cầu kết bạn.');
            return of({ type: '[Profile] Action Error' });
          })
        )
      )
    )
  );

  unfriend$ = createEffect(() =>
    this.actions$.pipe(
      ofType(unfriend),
      switchMap(({ friendId, friendName, jwt }) =>
        this.authService.removeFriend(friendId, jwt).pipe(
          map((res: any) => {
            if (res && res.code === 200) {
              this.toastr.success(`Đã hủy kết bạn với ${friendName}.`);
              return loadFriendsData({ jwt });
            } else {
              this.toastr.error(res.msg || 'Không thể hủy kết bạn.');
              return { type: '[Profile] No-op' };
            }
          }),
          catchError(() => {
            this.toastr.error('Lỗi khi thực hiện hủy kết bạn.');
            return of({ type: '[Profile] Action Error' });
          })
        )
      )
    )
  );
}
