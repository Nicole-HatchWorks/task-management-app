import type { Task } from "./types"
import { addDays, addWeeks, addMonths, isBefore, startOfDay } from "date-fns"

export function generateRecurringTasks(tasks: Task[]): Task[] {
  const today = startOfDay(new Date())
  const newTasks: Task[] = []
  const existingRecurringIds = new Set(
    tasks
      .filter((task) => task.recurring?.originalId)
      .map((task) => `${task.recurring?.originalId}-${new Date(task.dueDate).toDateString()}`),
  )

  tasks.forEach((task) => {
    if (!task.recurring) return

    // Skip tasks that are not original recurring tasks
    if (task.recurring.originalId) return

    const dueDate = new Date(task.dueDate)

    // If the task is already due in the future, don't generate new instances
    if (isBefore(today, dueDate)) return

    // Generate the next occurrence
    let nextDate: Date

    switch (task.recurring.frequency) {
      case "daily":
        nextDate = addDays(dueDate, 1)
        break
      case "weekly":
        nextDate = addWeeks(dueDate, 1)
        break
      case "monthly":
        nextDate = addMonths(dueDate, 1)
        break
      default:
        return
    }

    // Only generate if the next date is today or in the future
    if (!isBefore(nextDate, today)) {
      // Check if this instance already exists
      const instanceId = `${task.id}-${nextDate.toDateString()}`
      if (existingRecurringIds.has(instanceId)) {
        return
      }

      const newTask: Task = {
        ...task,
        id: `${task.id}-${nextDate.getTime()}`,
        dueDate: nextDate.toISOString(),
        completed: false,
        recurring: {
          ...task.recurring,
          originalId: task.id,
        },
      }

      newTasks.push(newTask)
    }
  })

  return newTasks
}

