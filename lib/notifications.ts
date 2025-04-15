import type { Task } from "./types"
import { differenceInHours } from "date-fns"

// Store notified tasks to prevent duplicate notifications
const notifiedTasks = new Set<string>()

export function checkDueTasks(tasks: Task[]) {
  if (Notification.permission !== "granted") return

  const now = new Date()

  tasks.forEach((task) => {
    if (task.completed) return

    const dueDate = new Date(task.dueDate)
    const hoursUntilDue = differenceInHours(dueDate, now)

    // Notify for tasks due in 24 hours or less
    if (hoursUntilDue <= 24 && hoursUntilDue > 0) {
      const notificationId = `${task.id}-${hoursUntilDue <= 1 ? "hour" : "day"}`

      // Check if we've already notified for this task at this threshold
      if (!notifiedTasks.has(notificationId)) {
        notifiedTasks.add(notificationId)

        const message =
          hoursUntilDue <= 1
            ? `Task "${task.title}" is due within the hour!`
            : `Task "${task.title}" is due in ${Math.floor(hoursUntilDue)} hours.`

        new Notification("Task Reminder", {
          body: message,
          icon: "/favicon.ico",
        })
      }
    }
  })
}

