import { createAction, props } from '@ngrx/store';
import { PostModel } from '../model/social.model';

// Load feed (page đầu hoặc switch filter)
export const loadFeed = createAction(
  '[Social] Load Feed',
  props<{ page: number; size: number; filterMode: 'ALL' | 'MINE'; userId?: string }>()
);

export const loadFeedSuccess = createAction(
  '[Social] Load Feed Success',
  props<{ posts: PostModel[]; page: number; hasMore: boolean; filterMode: 'ALL' | 'MINE' }>()
);

export const loadFeedFailure = createAction(
  '[Social] Load Feed Failure',
  props<{ error: string }>()
);

// Append page tiếp theo (infinite scroll)
export const loadMorePosts = createAction(
  '[Social] Load More Posts',
  props<{ page: number; size: number; filterMode: 'ALL' | 'MINE'; userId?: string }>()
);

export const loadMorePostsSuccess = createAction(
  '[Social] Load More Posts Success',
  props<{ posts: PostModel[]; page: number; hasMore: boolean }>()
);

// Prepend bài mới sau khi đăng
export const prependPost = createAction(
  '[Social] Prepend Post',
  props<{ post: PostModel }>()
);

// Xóa bài khỏi store (optimistic)
export const removePost = createAction(
  '[Social] Remove Post',
  props<{ postId: string }>()
);

// Cập nhật nội dung bài (sau edit)
export const updatePostContent = createAction(
  '[Social] Update Post Content',
  props<{ postId: string; content: string }>()
);

// Cập nhật likes (optimistic + sync)
export const updatePostLikes = createAction(
  '[Social] Update Post Likes',
  props<{ postId: string; likes: string[] }>()
);

// Thêm comment vào post
export const addCommentToPost = createAction(
  '[Social] Add Comment To Post',
  props<{ postId: string; comment: any }>()
);

// Toggle comment visibility + load
export const toggleComments = createAction(
  '[Social] Toggle Comments',
  props<{ postId: string }>()
);

export const loadCommentsSuccess = createAction(
  '[Social] Load Comments Success',
  props<{ postId: string; comments: any[] }>()
);

// Invalidate để force reload (sau submit post)
export const invalidateSocialCache = createAction(
  '[Social] Invalidate Cache'
);
