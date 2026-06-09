import { createFeatureSelector, createSelector } from '@ngrx/store';
import { profileFeatureKey } from '../reducers/profile.reducer';

export interface ProfileState {
  user: any | null;
  isLoadingProfile: boolean;
  isUpdatingProfile: boolean;
  friendsList: any[];
  pendingReceived: any[];
  pendingSent: any[];
  isLoadingFriends: boolean;
  error: string | null;
}

export const getProfileState = createFeatureSelector<ProfileState>(profileFeatureKey);

export const selectProfileUser = createSelector(
  getProfileState,
  (s) => s.user
);

export const selectIsLoadingProfile = createSelector(
  getProfileState,
  (s) => s.isLoadingProfile
);

export const selectIsUpdatingProfile = createSelector(
  getProfileState,
  (s) => s.isUpdatingProfile
);

export const selectFriendsList = createSelector(
  getProfileState,
  (s) => s.friendsList
);

export const selectPendingReceived = createSelector(
  getProfileState,
  (s) => s.pendingReceived
);

export const selectPendingSent = createSelector(
  getProfileState,
  (s) => s.pendingSent
);

export const selectIsLoadingFriends = createSelector(
  getProfileState,
  (s) => s.isLoadingFriends
);

export const selectProfileError = createSelector(
  getProfileState,
  (s) => s.error
);
