import { createAction, props } from '@ngrx/store';
import { ResultModel } from '../model/result.model';

// Load User Profile
export const loadProfile = createAction(
  '[Profile] Load Profile',
  props<{ jwt: string }>()
);

export const loadProfileSuccess = createAction(
  '[Profile] Load Profile Success',
  props<{ user: any }>()
);

export const loadProfileFailure = createAction(
  '[Profile] Load Profile Failure',
  props<{ error: string }>()
);

// Update User Profile
export const updateProfile = createAction(
  '[Profile] Update Profile',
  props<{ user: any; jwt: string }>()
);

export const updateProfileSuccess = createAction(
  '[Profile] Update Profile Success',
  props<{ user: any }>()
);

export const updateProfileFailure = createAction(
  '[Profile] Update Profile Failure',
  props<{ error: string }>()
);

// Load Friends Data (Friends list, pending received, pending sent)
export const loadFriendsData = createAction(
  '[Profile] Load Friends Data',
  props<{ jwt: string }>()
);

export const loadFriendsDataSuccess = createAction(
  '[Profile] Load Friends Data Success',
  props<{ friendsList: any[]; pendingReceived: any[]; pendingSent: any[] }>()
);

export const loadFriendsDataFailure = createAction(
  '[Profile] Load Friends Data Failure',
  props<{ error: string }>()
);

// Friend Request Actions
export const acceptFriendRequest = createAction(
  '[Profile] Accept Friend Request',
  props<{ notificationId: string; jwt: string }>()
);

export const declineFriendRequest = createAction(
  '[Profile] Decline Friend Request',
  props<{ notificationId: string; jwt: string }>()
);

export const cancelSentRequest = createAction(
  '[Profile] Cancel Sent Request',
  props<{ receiverId: string; jwt: string }>()
);

export const unfriend = createAction(
  '[Profile] Unfriend',
  props<{ friendId: string; friendName: string; jwt: string }>()
);
