/**
 * userApi.js — maps to UserController (/api/users)
 *
 *   GET  /api/users/me            getMyProfile()
 *   PUT  /api/users/me            updateMyProfile(userUpdateRequest)
 *   PUT  /api/users/me/password   changePassword(changePasswordRequest)
 *   GET  /api/users/{id}          getById(id)
 *   GET  /api/users               getAll()             (admin)
 *
 * Note: the backend only exposes read access to other users (getById/getAll)
 * plus self-service update/password-change. There is no endpoint here for an
 * admin to create a user, edit another user's role, or delete a user — see
 * MAPPING.md for details before wiring any "manage other users" UI to this
 * module.
 */
import { apiGet, apiPut, request } from './apiClient.js';

export const getMyProfile = () => apiGet('/users/me');

/** @param {object} userUpdateRequest */
export const updateMyProfile = (userUpdateRequest) => apiPut('/users/me', userUpdateRequest);

/** @param {{currentPassword:string, newPassword:string}} changePasswordRequest */
export const changePassword = (changePasswordRequest) =>
  request('/users/me/password', { method: 'PUT', body: changePasswordRequest, parseJson: false });

export const getById = (id) => apiGet(`/users/${id}`);

export const getAll = () => apiGet('/users');