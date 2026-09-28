/**
 * categoryApi.js — maps to CategoryController (/api/categories)
 *
 *   GET    /api/categories                  getAll()
 *   GET    /api/categories/top-level        getTopLevel()
 *   GET    /api/categories/{id}             getById(id)
 *   GET    /api/categories/{id}/subcategories  getSubCategories(id)
 *   POST   /api/categories                  create(categoryRequest)
 *   PUT    /api/categories/{id}             update(id, categoryRequest)
 *   DELETE /api/categories/{id}             remove(id)
 *
 * create/update/delete require an authenticated admin session (send the
 * JWT via apiClient's auth header, attached automatically when logged in).
 */
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient.js';

export const getAll = () => apiGet('/categories');
export const getTopLevel = () => apiGet('/categories/top-level');
export const getById = (id) => apiGet(`/categories/${id}`);
export const getSubCategories = (id) => apiGet(`/categories/${id}/subcategories`);

/** @param {{name:string, parentId?:number}} categoryRequest */
export const create = (categoryRequest) => apiPost('/categories', categoryRequest);

/** @param {number} id @param {{name:string, parentId?:number}} categoryRequest */
export const update = (id, categoryRequest) => apiPut(`/categories/${id}`, categoryRequest);

export const remove = (id) => apiDelete(`/categories/${id}`);