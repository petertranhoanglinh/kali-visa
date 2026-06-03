import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { switchMap, map, catchError, withLatestFrom, filter } from 'rxjs/operators';

import { SocialService } from '../service/social.service';
import {
  loadFeed,
  loadFeedSuccess,
  loadFeedFailure,
  loadMorePosts,
  loadMorePostsSuccess,
  toggleComments,
  loadCommentsSuccess,
} from '../actions/social.actions';
import {
  selectSocialIsLoaded,
  selectSocialFilterMode,
  selectPosts,
} from '../selectors/social.selector';

@Injectable()
export class SocialEffect {

  constructor(
    private actions$: Actions,
    private store: Store,
    private socialService: SocialService,
  ) {}

  /**
   * Load feed page đầu.
   * Nếu đã loaded + cùng filterMode → bỏ qua (cache hit).
   */
  loadFeed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadFeed),
      withLatestFrom(
        this.store.select(selectSocialIsLoaded),
        this.store.select(selectSocialFilterMode),
      ),
      // Cache hit: đã loaded + đúng filter → skip
      filter(([action, isLoaded, cachedFilter]) =>
        !isLoaded || action.filterMode !== cachedFilter
      ),
      switchMap(([action]) =>
        this.socialService.getAllPosts(0, action.size, action.filterMode === 'MINE' ? action.userId : undefined).pipe(
          map((res: any) => loadFeedSuccess({
            posts: res.content || [],
            page: 0,
            hasMore: !res.last,
            filterMode: action.filterMode,
          })),
          catchError(err => of(loadFeedFailure({ error: err.message || 'Load feed failed' })))
        )
      )
    )
  );

  /**
   * Load page tiếp theo — luôn gọi API.
   */
  loadMorePosts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadMorePosts),
      switchMap(({ page, size, filterMode, userId }) =>
        this.socialService.getAllPosts(page, size, filterMode === 'MINE' ? userId : undefined).pipe(
          map((res: any) => loadMorePostsSuccess({
            posts: res.content || [],
            page,
            hasMore: !res.last,
          })),
          catchError(err => of(loadFeedFailure({ error: err.message || 'Load more failed' })))
        )
      )
    )
  );

  /**
   * Toggle comments: load từ API nếu chưa có.
   */
  toggleComments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(toggleComments),
      withLatestFrom(this.store.select(selectPosts)),
      switchMap(([{ postId }, posts]) => {
        const post = posts.find(p => p.id === postId);
        // Nếu đã có comments trong store → không cần gọi API
        if (!post || post.comments) {
          return of({ type: '[Social] No-op' }); // empty action
        }
        return this.socialService.getComments(postId).pipe(
          map(comments => loadCommentsSuccess({ postId, comments })),
          catchError(() => of({ type: '[Social] Comments Load Error' }))
        );
      })
    )
  );
}
