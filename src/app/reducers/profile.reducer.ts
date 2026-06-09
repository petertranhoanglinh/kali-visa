import { createReducer, on } from '@ngrx/store';
import {
  loadProfile,
  loadProfileSuccess,
  loadProfileFailure,
  updateProfile,
  updateProfileSuccess,
  updateProfileFailure,
  loadFriendsData,
  loadFriendsDataSuccess,
  loadFriendsDataFailure
} from '../actions/profile.actions';
import { ProfileState } from '../selectors/profile.selector';

export const profileFeatureKey = 'profile';

export const initialState: ProfileState = {
  user: null,
  isLoadingProfile: false,
  isUpdatingProfile: false,
  friendsList: [],
  pendingReceived: [],
  pendingSent: [],
  isLoadingFriends: false,
  error: null,
};

export const profileReducer = createReducer(
  initialState,

  // Load profile
  on(loadProfile, (state) => ({
    ...state,
    isLoadingProfile: true,
    error: null
  })),
  on(loadProfileSuccess, (state, { user }) => ({
    ...state,
    user,
    isLoadingProfile: false,
    error: null
  })),
  on(loadProfileFailure, (state, { error }) => ({
    ...state,
    isLoadingProfile: false,
    error
  })),

  // Update profile
  on(updateProfile, (state) => ({
    ...state,
    isUpdatingProfile: true,
    error: null
  })),
  on(updateProfileSuccess, (state, { user }) => ({
    ...state,
    user,
    isUpdatingProfile: false,
    error: null
  })),
  on(updateProfileFailure, (state, { error }) => ({
    ...state,
    isUpdatingProfile: false,
    error
  })),

  // Load Friends Data
  on(loadFriendsData, (state) => ({
    ...state,
    isLoadingFriends: true,
    error: null
  })),
  on(loadFriendsDataSuccess, (state, { friendsList, pendingReceived, pendingSent }) => ({
    ...state,
    friendsList,
    pendingReceived,
    pendingSent,
    isLoadingFriends: false,
    error: null
  })),
  on(loadFriendsDataFailure, (state, { error }) => ({
    ...state,
    isLoadingFriends: false,
    error
  }))
);
