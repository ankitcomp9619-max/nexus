import api from './api'

export const taskService = {
  getAll: () => api.get('/tasks'),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.patch(`/tasks/${id}`, data),
  remove: (id) => api.delete(`/tasks/${id}`),
  getDependencies: (id) => api.get(`/tasks/${id}/dependencies`),
  addDependency: (id, dependencyId) => api.post(`/tasks/${id}/dependencies`, { dependencyId }),
  removeDependency: (id, depId) => api.delete(`/tasks/${id}/dependencies/${depId}`),
  getDependentsBFS: (id) => api.get(`/tasks/${id}/dependents/bfs`),
}
