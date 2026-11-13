export const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const isOverdue = (deadline) => {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

export const priorityColor = (priority) => {
  const map = { high: 'red', medium: 'amber', low: 'green' }
  return map[priority] || 'slate'
}

export const statusColor = (status) => {
  const map = { 'completed': 'green', 'in progress': 'blue', 'pending': 'slate' }
  return map[status] || 'slate'
}

export const getInitials = (name) => {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
