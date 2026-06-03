import { createReducer, on } from '@ngrx/store';
import { SocialState } from '../selectors/social.selector';
import {
  loadFeed,
  loadFeedSuccess,
  loadFeedFailure,
  loadMorePosts,
  loadMorePostsSuccess,
  prependPost,
  removePost,
  updatePostContent,
  updatePostLikes,
  addCommentToPost,
  toggleComments,
  loadCommentsSuccess,
  invalidateSocialCache,
} from '../actions/social.actions';

export const socialFeatureKey = 'social';

export const initialState: SocialState = {
  posts: [],
  currentPage: 0,
  hasMore: true,
  isLoading: false,
  isLoadingMore: false,
  isLoaded: false,
  filterMode: 'ALL',
  error: null,
};

export const socialReducer = createReducer(
  initialState,

  // Load feed (reset)
  on(loadFeed, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(loadFeedSuccess, (state, { posts, page, hasMore, filterMode }) => ({
    ...state,
    posts,
    currentPage: page,
    hasMore,
    filterMode,
    isLoading: false,
    isLoaded: true,
    error: null,
  })),

  on(loadFeedFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    isLoadingMore: false,
    error,
  })),

  // Append thêm posts
  on(loadMorePosts, (state) => ({
    ...state,
    isLoadingMore: true,
    error: null,
  })),

  on(loadMorePostsSuccess, (state, { posts, page, hasMore }) => ({
    ...state,
    posts: [...state.posts, ...posts],
    currentPage: page,
    hasMore,
    isLoadingMore: false,
    error: null,
  })),

  // Optimistic: thêm bài mới lên đầu
  on(prependPost, (state, { post }) => ({
    ...state,
    posts: [post, ...state.posts],
  })),

  // Optimistic: xóa bài
  on(removePost, (state, { postId }) => ({
    ...state,
    posts: state.posts.filter(p => p.id !== postId),
  })),

  // Cập nhật nội dung bài sau edit
  on(updatePostContent, (state, { postId, content }) => ({
    ...state,
    posts: state.posts.map(p =>
      p.id === postId ? { ...p, content } : p
    ),
  })),

  // Cập nhật likes
  on(updatePostLikes, (state, { postId, likes }) => ({
    ...state,
    posts: state.posts.map(p =>
      p.id === postId ? { ...p, likes } : p
    ),
  })),

  // Thêm comment
  on(addCommentToPost, (state, { postId, comment }) => ({
    ...state,
    posts: state.posts.map(p =>
      p.id === postId
        ? { ...p, comments: [...(p.comments || []), comment] }
        : p
    ),
  })),

  // Toggle show comments
  on(toggleComments, (state, { postId }) => ({
    ...state,
    posts: state.posts.map(p =>
      p.id === postId ? { ...p, showComments: !p.showComments } : p
    ),
  })),

  // Load comments success
  on(loadCommentsSuccess, (state, { postId, comments }) => ({
    ...state,
    posts: state.posts.map(p =>
      p.id === postId ? { ...p, comments } : p
    ),
  })),

  // Invalidate → reset về initial (không xóa filterMode)
  on(invalidateSocialCache, (state) => ({
    ...state,
    posts: [],
    currentPage: 0,
    hasMore: true,
    isLoaded: false,
    error: null,
  })),
);
