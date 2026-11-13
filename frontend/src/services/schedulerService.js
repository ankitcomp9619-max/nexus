import api from './api'

export const schedulerService = {
  getGreedySchedule: () => api.get('/tasks/schedule/greedy'),
  getTopologicalOrder: () => api.get('/tasks/topological-sort'),
}
