"use client"

import { useState, useEffect } from "react"
import TaskList from "@/components/task-list"
import TaskForm from "@/components/task-form"
import Calendar from "@/components/calendar"
import FilterBar from "@/components/filter-bar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle } from "lucide-react"
import { useTaskStore } from "@/lib/task-store"
import { checkDueTasks } from "@/lib/notifications"
import type { Task } from "@/lib/types"

export default function TaskManager() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [activeView, setActiveView] = useState("list")
  const { tasks, loadTasks } = useTaskStore()
  const [filters, setFilters] = useState({
    status: "all",
    dueDate: "all",
  })

  useEffect(() => {
    // Load tasks only once when component mounts
    loadTasks()

    // Set up notification check interval
    const notificationInterval = setInterval(() => {
      checkDueTasks(tasks)
    }, 60000)

    // Request notification permission
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission()
    }

    return () => clearInterval(notificationInterval)
  }, [loadTasks])

  // Add a separate effect for checking notifications
  useEffect(() => {
    // Initial check for notifications when tasks change
    checkDueTasks(tasks)
  }, [tasks])

  // Add a separate effect for generating recurring tasks
  useEffect(() => {
    // Only run once on component mount
    const generateInterval = setInterval(() => {
      const { generateRecurringInstances } = useTaskStore.getState()
      generateRecurringInstances()
    }, 3600000) // Check for new recurring tasks every hour

    return () => clearInterval(generateInterval)
  }, [])

  const handleAddTask = () => {
    setEditingTask(null)
    setIsFormOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingTask(null)
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters })
  }

  const filteredTasks = tasks.filter((task) => {
    // Filter by status
    if (filters.status === "completed" && !task.completed) return false
    if (filters.status === "pending" && (task.completed || task.inProgress)) return false
    if (filters.status === "in-progress" && (!task.inProgress || task.completed)) return false

    // Filter by due date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (filters.dueDate === "today") {
      const taskDate = new Date(task.dueDate)
      taskDate.setHours(0, 0, 0, 0)
      if (taskDate.getTime() !== today.getTime()) return false
    } else if (filters.dueDate === "upcoming") {
      const taskDate = new Date(task.dueDate)
      taskDate.setHours(0, 0, 0, 0)
      if (taskDate.getTime() <= today.getTime()) return false
    } else if (filters.dueDate === "overdue") {
      const taskDate = new Date(task.dueDate)
      taskDate.setHours(0, 0, 0, 0)
      if (taskDate.getTime() >= today.getTime() || task.completed) return false
    }

    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestor de Tareas</h1>
          <p className="text-gray-600">Organiza tus tareas con facilidad</p>
        </header>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="list">Vista de Lista</TabsTrigger>
                <TabsTrigger value="calendar">Vista de Calendario</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button onClick={handleAddTask} className="bg-purple-500 hover:bg-purple-600">
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Tarea
            </Button>
          </div>

          {activeView === "list" && (
            <>
              <FilterBar onFilterChange={handleFilterChange} />
              <TaskList tasks={filteredTasks} onEditTask={handleEditTask} />
            </>
          )}

          {activeView === "calendar" && <Calendar tasks={tasks} onEditTask={handleEditTask} />}
        </div>
      </div>

      {isFormOpen && <TaskForm task={editingTask} onClose={handleCloseForm} />}
    </div>
  )
}

