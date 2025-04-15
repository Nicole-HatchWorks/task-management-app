"use client"

import { useState } from "react"
import type { Task } from "@/lib/types"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
  isWithinInterval,
} from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"

interface CalendarProps {
  tasks: Task[]
  onEditTask: (task: Task) => void
}

export default function Calendar({ tasks, onEditTask }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      // Para tareas con rango de fechas
      if (task.startDate) {
        const startDate = parseISO(task.startDate)
        const endDate = parseISO(task.dueDate)
        return isWithinInterval(date, { start: startDate, end: endDate })
      }

      // Para tareas con fecha única
      const taskDate = parseISO(task.dueDate)
      return isSameDay(taskDate, date)
    })
  }

  const isTaskStart = (task: Task, date: Date) => {
    if (!task.startDate) return false
    return isSameDay(parseISO(task.startDate), date)
  }

  const isTaskEnd = (task: Task, date: Date) => {
    return isSameDay(parseISO(task.dueDate), date)
  }

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{format(currentMonth, "MMMM yyyy", { locale: es })}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div key={day} className="text-center font-medium text-sm py-2">
            {day}
          </div>
        ))}

        {Array.from({ length: monthStart.getDay() }).map((_, index) => (
          <div key={`empty-start-${index}`} className="h-24 p-1 bg-gray-50 rounded-md" />
        ))}

        {monthDays.map((day) => {
          const dayTasks = getTasksForDate(day)
          const isSelected = selectedDate && isSameDay(day, selectedDate)

          return (
            <div
              key={day.toString()}
              className={`h-24 p-1 rounded-md border transition-colors cursor-pointer overflow-hidden ${
                isToday(day)
                  ? "bg-blue-50 border-blue-200"
                  : isSelected
                    ? "bg-purple-50 border-purple-200"
                    : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedDate(day)}
            >
              <div className="text-right mb-1">
                <span
                  className={`text-sm inline-block rounded-full w-6 h-6 text-center leading-6 ${
                    isToday(day) ? "bg-blue-500 text-white" : ""
                  }`}
                >
                  {format(day, "d")}
                </span>
              </div>

              <div className="space-y-1">
                {dayTasks.slice(0, 2).map((task) => {
                  const isStart = isTaskStart(task, day)
                  const isEnd = isTaskEnd(task, day)

                  return (
                    <div
                      key={task.id}
                      className={`text-xs truncate rounded px-1 py-0.5 ${
                        task.completed
                          ? "line-through text-gray-500 bg-gray-100"
                          : task.inProgress
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                      } ${isStart ? "border-l-2 border-l-green-500" : ""} ${
                        isEnd ? "border-r-2 border-r-red-500" : ""
                      }`}
                      style={{
                        backgroundColor: task.color ? `${task.color}20` : undefined,
                        color: task.color,
                      }}
                    >
                      {task.inProgress && !task.completed && <Clock className="inline h-2 w-2 mr-1" />}
                      {task.title}
                    </div>
                  )
                })}

                {dayTasks.length > 2 && <div className="text-xs text-gray-500">+{dayTasks.length - 2} más</div>}
              </div>
            </div>
          )
        })}

        {Array.from({ length: (7 - (monthEnd.getDay() + 1)) % 7 }).map((_, index) => (
          <div key={`empty-end-${index}`} className="h-24 p-1 bg-gray-50 rounded-md" />
        ))}
      </div>

      {selectedDate && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">
            Tareas para {format(selectedDate, "MMMM d, yyyy", { locale: es })}
          </h3>

          {selectedDateTasks.length === 0 ? (
            <p className="text-gray-500">No hay tareas para esta fecha.</p>
          ) : (
            <div className="space-y-2">
              {selectedDateTasks.map((task) => {
                const isStart = isTaskStart(task, selectedDate)
                const isEnd = isTaskEnd(task, selectedDate)

                return (
                  <div
                    key={task.id}
                    className="p-2 rounded-md border flex items-center gap-3 hover:bg-gray-50"
                    onClick={() => onEditTask(task)}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: task.color || "#9333ea" }} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={task.completed ? "line-through text-gray-500" : ""}>{task.title}</p>
                        {task.inProgress && !task.completed && (
                          <Badge variant="outline" className="text-blue-600 text-xs">
                            <Clock className="h-2 w-2 mr-1" />
                            En progreso
                          </Badge>
                        )}
                      </div>

                      {task.startDate && (
                        <p className="text-xs text-gray-500">
                          {isStart && <span className="text-green-600">Inicio: </span>}
                          {isEnd && <span className="text-red-600">Fin: </span>}
                          {!isStart && !isEnd && <span>Periodo: </span>}
                          {format(parseISO(task.startDate), "dd MMM", { locale: es })} -{" "}
                          {format(parseISO(task.dueDate), "dd MMM", { locale: es })}
                        </p>
                      )}

                      {task.subtasks && task.subtasks.length > 0 && (
                        <p className="text-xs text-gray-500">
                          Subtareas: {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length}{" "}
                          completadas
                        </p>
                      )}
                    </div>
                    <Badge variant={task.completed ? "outline" : "default"}>
                      {task.completed ? "Completada" : "Pendiente"}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

