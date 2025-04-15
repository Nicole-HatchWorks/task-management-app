"use client"

import { useState } from "react"
import type { Task } from "@/lib/types"
import { useTaskStore } from "@/lib/task-store"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, RepeatIcon, ChevronDown, ChevronRight, Clock, Calendar } from "lucide-react"
import { format, isPast, isToday, parseISO } from "date-fns"
import { es } from "date-fns/locale"

interface TaskListProps {
  tasks: Task[]
  onEditTask: (task: Task) => void
}

export default function TaskList({ tasks, onEditTask }: TaskListProps) {
  const { toggleTaskCompletion, deleteTask, toggleTaskProgress, toggleSubtaskCompletion, toggleSubtaskProgress } =
    useTaskStore()

  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({})

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }))
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No se encontraron tareas. Añade una nueva tarea para comenzar.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const dueDate = new Date(task.dueDate)
        const isOverdue = isPast(dueDate) && !isToday(dueDate) && !task.completed
        const hasSubtasks = task.subtasks && task.subtasks.length > 0
        const isExpanded = expandedTasks[task.id] || false

        // Calcular el progreso de las subtareas
        const subtaskProgress = hasSubtasks
          ? Math.round((task.subtasks!.filter((st) => st.completed).length / task.subtasks!.length) * 100)
          : 0

        return (
          <Card
            key={task.id}
            className={`transition-all ${
              task.completed
                ? "opacity-70"
                : isOverdue
                  ? "border-red-200 bg-red-50"
                  : task.inProgress
                    ? "border-blue-200 bg-blue-50"
                    : ""
            }`}
            style={{
              borderLeft: task.color ? `4px solid ${task.color}` : undefined,
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTaskCompletion(task.id)}
                  className="mt-1"
                />

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {hasSubtasks && (
                        <button
                          onClick={() => toggleTaskExpanded(task.id)}
                          className="p-1 rounded-md hover:bg-gray-100"
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      )}
                      <h3 className={`font-medium ${task.completed ? "line-through text-gray-500" : ""}`}>
                        {task.title}
                      </h3>

                      {task.inProgress && !task.completed && (
                        <Badge variant="outline" className="text-blue-600">
                          <Clock className="h-3 w-3 mr-1" />
                          En progreso
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {task.recurring && (
                        <Badge variant="outline" className="flex items-center gap-1 text-purple-600">
                          <RepeatIcon className="h-3 w-3" />
                          {task.recurring.frequency === "daily"
                            ? "Diaria"
                            : task.recurring.frequency === "weekly"
                              ? "Semanal"
                              : "Mensual"}
                        </Badge>
                      )}

                      {task.startDate ? (
                        <Badge
                          variant={isOverdue ? "destructive" : isToday(dueDate) ? "default" : "outline"}
                          className="flex items-center gap-1"
                        >
                          <Calendar className="h-3 w-3" />
                          {format(parseISO(task.startDate), "dd MMM", { locale: es })} -{" "}
                          {format(dueDate, "dd MMM", { locale: es })}
                        </Badge>
                      ) : (
                        <Badge variant={isOverdue ? "destructive" : isToday(dueDate) ? "default" : "outline"}>
                          {format(dueDate, "dd MMM", { locale: es })}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}

                  {hasSubtasks && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Progreso: {subtaskProgress}%</span>
                        <span>
                          {task.subtasks!.filter((st) => st.completed).length}/{task.subtasks!.length} completadas
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${subtaskProgress}%` }}></div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-2">
                          {task.subtasks!.map((subtask) => (
                            <div key={subtask.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={subtask.completed}
                                  onCheckedChange={() => toggleSubtaskCompletion(task.id, subtask.id)}
                                  disabled={task.completed}
                                />
                                <span className={subtask.completed ? "line-through text-gray-500" : ""}>
                                  {subtask.title}
                                </span>
                                {subtask.inProgress && !subtask.completed && (
                                  <Badge variant="outline" className="text-blue-600 text-xs">
                                    <Clock className="h-2 w-2 mr-1" />
                                    En progreso
                                  </Badge>
                                )}
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleSubtaskProgress(task.id, subtask.id)}
                                className={subtask.inProgress ? "text-blue-600" : ""}
                                disabled={task.completed || subtask.completed}
                              >
                                <Clock className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between mt-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={task.inProgress ? "text-blue-600 border-blue-200" : ""}
                      onClick={() => toggleTaskProgress(task.id)}
                      disabled={task.completed}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      {task.inProgress ? "En progreso" : "Marcar en progreso"}
                    </Button>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEditTask(task)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

