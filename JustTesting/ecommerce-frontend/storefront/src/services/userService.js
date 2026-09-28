import api from "./api";

// UserController contract (all authenticated):
//   GET  /users/me                  → UserResponse {id,name,email,role}
//   PUT  /users/me {name,email}     → UserResponse
//   PUT  /users/me/password {currentPassword,newPassword} → 204
export const getMe = () => api.get("/users/me");

export const updateMe = (data) => api.put("/users/me", data);

export const changePassword = (data) => api.put("/users/me/password", data);