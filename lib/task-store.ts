"use client"

import { create } from "zustand"
import type { Task, SubTask } from "./types"
import { generateRecurringTasks } from "./recurring-tasks"

interface TaskStore {
  tasks: Task[]
  addTask: (task: Task) => void
  updateTask: (updatedTask: Task) => void
  deleteTask: (id: string) => void
  toggleTaskCompletion: (id: string) => void
  toggleTaskProgress: (id: string) => void
  addSubtask: (taskId: string, subtask: SubTask) => void
  updateSubtask: (taskId: string, subtask: SubTask) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => void
  toggleSubtaskProgress: (taskId: string, subtaskId: string) => void
  loadTasks: () => void
  generateRecurringInstances: () => void
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],

  addTask: (task: Task) => {
    set((state) => {
      const newTasks = [...state.tasks, task]
      localStorage.setItem("tasks", JSON.stringify(newTasks))
      return { tasks: newTasks }
    })
  },

  updateTask: (updatedTask: Task) => {
    set((state) => {
      const newTasks = state.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      localStorage.setItem("tasks", JSON.stringify(newTasks))
      return { tasks: newTasks }
    })
  },

  deleteTask: (id: string) => {
    set((state) => {
      const newTasks = state.tasks.filter((task) => task.id !== id)
      localStorage.setItem("tasks", JSON.stringify(newTasks))
      return { tasks: newTasks }
    })
  },

  toggleTaskCompletion: (id: string) => {
    set((state) => {
      const newTasks = state.tasks.map((task) => {
        if (task.id === id) {
          // Si la tarea tiene subtareas, marcarlas todas como completadas también
          const updatedSubtasks = task.subtasks
            ? task.subtasks.map((subtask) => ({
                ...subtask,
                completed: !task.completed,
                inProgress: task.completed ? false : subtask.inProgress,
              }))
            : undefined

          return {
            ...task,
            completed: !task.completed,
            inProgress: task.completed ? false : task.inProgress,
            subtasks: updatedSubtasks,
          }
        }
        return task
      })
      localStorage.setItem("tasks", JSON.stringify(newTasks))
      return { tasks: newTasks }
    })
  },

  toggleTaskProgress: (id: string) => {
    set((state) => {
      const newTasks = state.tasks.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            inProgress: !task.inProgress,
            completed: task.inProgress ? task.completed : false,
          }
        }
        return task
      })
      localStorage.setItem("tasks", JSON.stringify(newTasks))
      return { tasks: newTasks }
    })
  },

  addSubtask: (taskId: string, subtask: SubTask) => {
    set((state) => {
      const newTasks = state.tasks.map((task) => {
        if (task.id === taskId) {
          const subtasks = task.subtasks ? [...task.subtasks, subtask] : [subtask]
          return { ...task, subtasks }
        }
        return task
      })
      localStorage.setItem("tasks", JSON.stringify(newTasks))
      return { tasks: newTasks }
    })
  },

  updateSubtask: (taskId: string, updatedSubtask: SubTask) => {
    set((state) => {
      const newTasks = state.tasks.map((task) => {
        if (task.id === taskId && task.subtasks) {
          const subtasks = task.subtasks.map((subtask) => (subtask.id === updatedSubtask.id ? updatedSubtask : subtask))
          return { ...task, subtasks }
        }
        return task
      })
      localStorage.setItem("tasks", JSON.stringify(newTasks))
      return { tasks: newTasks }
    })
  },

  deleteSubtask: (taskId: string, subtaskId: string) => {
    set((state) => {
      const newTasks = state.tasks.map((task) => {
        if (task.id === taskId && task.subtasks) {
          const subtasks = task.subtasks.filter((subtask) => subtask.id !== subtaskId)
          return { ...task, subtasks }
        }
        return task
      })
      localStorage.setItem("tasks", JSON.stringify(newTasks))
      return { tasks: newTasks }
    })
  },

  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => {
    set((state) => {
      const newTasks = state.tasks.map((task) => {
        if (task.id === taskId && task.subtasks) {
          const subtasks = task.subtasks.map((subtask) => {
            if (subtask.id === subtaskId) {
              return {
                ...subtask,
                completed: !subtask.completed,
                inProgress: subtask.completed ? false : subtask.inProgress,
              }
            }
            return subtask
          })

          // Verificar si todas las subtareas están completadas
          const allSubtasksCompleted = subtasks.every((subtask) => subtask.completed)
          const anySubtaskInProgress = subtasks.some((subtask) => subtask.inProgress)

          return {
            ...task,
            subtasks,
            // Actualizar el estado de la tarea principal basado en las subtareas
            completed: allSubtasksCompleted,
            inProgress: !allSubtasksCompleted && anySubtaskInProgress,
          }
        }
        return task
      })
      localStorage.setItem("tasks", JSON.stringify(newTasks))
      return { tasks: newTasks }
    })
  },

  toggleSubtaskProgress: (taskId: string, subtaskId: string) => {
    set((state) => {
      const newTasks = state.tasks.map((task) => {
        if (task.id === taskId && task.subtasks) {
          const subtasks = task.subtasks.map((subtask) => {
            if (subtask.id === subtaskId) {
              return {
                ...subtask,
                inProgress: !subtask.inProgress,
                completed: subtask.inProgress ? subtask.completed : false,
              }
            }
            return subtask
          })

          // Verificar si todas las subtareas están completadas o alguna está en progreso
          const allSubtasksCompleted = subtasks.every((subtask) => subtask.completed)
          const anySubtaskInProgress = subtasks.some((subtask) => subtask.inProgress)

          return {
            ...task,
            subtasks,
            completed: allSubtasksCompleted,
            inProgress: !allSubtasksCompleted && anySubtaskInProgress,
          }
        }
        return task
      })
      localStorage.setItem("tasks", JSON.stringify(newTasks))
      return { tasks: newTasks }
    })
  },

  loadTasks: () => {
    // Only load tasks from localStorage, don't regenerate recurring tasks here
    const savedTasks = localStorage.getItem("tasks")
    const tasks: Task[] = savedTasks ? JSON.parse(savedTasks) : []

    set({ tasks })
  },

  generateRecurringInstances: () => {
    const { tasks } = get()
    // Generate recurring tasks
    const recurringTasks = generateRecurringTasks(tasks)

    // Only update if there are new recurring tasks to add
    if (recurringTasks.length > 0) {
      set((state) => ({
        tasks: [...state.tasks, ...recurringTasks],
      }))
    }
  },
}))

