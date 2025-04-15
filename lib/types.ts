export interface SubTask {
  id: string
  title: string
  completed: boolean
  inProgress?: boolean
}

export interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  startDate?: string // Para rangos de fechas
  completed: boolean
  inProgress?: boolean
  color?: string
  recurring?: {
    frequency: "daily" | "weekly" | "monthly"
    originalId?: string
  }
  subtasks?: SubTask[]
}

export type FilterStatus = "all" | "completed" | "pending" | "in-progress"
export type FilterDueDate = "all" | "today" | "upcoming" | "overdue"

