/**
 * productApi.js — maps to ProductController (/api/products)
 *
 *   GET    /api/products                       getAll()
 *   GET    /api/products/{id}                   getById(id)
 *   GET    /api/products/category/{categoryId}  getByCategory(categoryId)
 *   GET    /api/products/search?keyword=        search(keyword)
 *   POST   /api/products            (multipart) create(fields, file)
 *   PUT    /api/products/{id}       (multipart) update(id, fields, file)
 *   DELETE /api/products/{id}                   remove(id)
 *
 * create/update are multipart/form-data because ProductController takes a
 * @ModelAttribute ProductRequest plus a @RequestParam("file") MultipartFile.
 * `file` is required by the backend on create, optional on update — pass
 * `null` on update to leave the existing image untouched.
 */
import { apiGet, apiDelete, request } from './apiClient.js';

export const getAll = () => apiGet('/products');
export const getById = (id) => apiGet(`/products/${id}`);
export const getByCategory = (categoryId) => apiGet(`/products/category/${categoryId}`);
export const search = (keyword) => apiGet(`/products/search?keyword=${encodeURIComponent(keyword)}`);

function buildProductFormData(fields, file) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  if (file) formData.append('file', file);
  return formData;
}

/**
 * @param {{name:string, categoryId:number, price:number, stockQuantity:number, description?:string}} fields
 * @param {File} file  Required by the backend for create.
 */
export const create = (fields, file) =>
  request('/products', { method: 'POST', body: buildProductFormData(fields, file) });

/**
 * @param {number} id
 * @param {{name:string, categoryId:number, price:number, stockQuantity:number, description?:string}} fields
 * @param {File|null} [file]  Optional — omit to keep the current image.
 */
export const update = (id, fields, file = null) =>
  request(`/products/${id}`, { method: 'PUT', body: buildProductFormData(fields, file) });

export const remove = (id) => apiDelete(`/products/${id}`);