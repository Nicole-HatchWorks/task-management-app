"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTaskStore } from "@/lib/task-store"
import type { Task, SubTask } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { format, addDays } from "date-fns"
import { PlusCircle, X, Edit2, Check, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TaskFormProps {
  task: Task | null
  onClose: () => void
}

const COLORS = [
  { name: "Purple", value: "#9333ea" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Yellow", value: "#eab308" },
  { name: "Red", value: "#ef4444" },
  { name: "Pink", value: "#ec4899" },
]

export default function TaskForm({ task, onClose }: TaskFormProps) {
  const { addTask, updateTask, addSubtask, updateSubtask, deleteSubtask } = useTaskStore()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [startDate, setStartDate] = useState("")
  const [useRangeDate, setUseRangeDate] = useState(false)
  const [color, setColor] = useState("none")
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState<"daily" | "weekly" | "monthly">("weekly")
  const [subtasks, setSubtasks] = useState<SubTask[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || "")

      if (task.startDate) {
        setUseRangeDate(true)
        setStartDate(format(new Date(task.startDate), "yyyy-MM-dd"))
        setDueDate(format(new Date(task.dueDate), "yyyy-MM-dd"))
      } else {
        setUseRangeDate(false)
        setDueDate(format(new Date(task.dueDate), "yyyy-MM-dd"))
        // Set default start date to one day before due date
        setStartDate(format(addDays(new Date(task.dueDate), -1), "yyyy-MM-dd"))
      }

      setColor(task.color || "none")
      setIsRecurring(!!task.recurring)
      if (task.recurring) {
        setRecurringFrequency(task.recurring.frequency)
      }

      setSubtasks(task.subtasks || [])
    } else {
      // Set default due date to today
      const today = new Date()
      setDueDate(format(today, "yyyy-MM-dd"))
      // Set default start date to today
      setStartDate(format(today, "yyyy-MM-dd"))
      setColor("none")
      setSubtasks([])
    }
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const taskData: Task = {
      id: task?.id || uuidv4(),
      title,
      description,
      dueDate: new Date(dueDate).toISOString(),
      ...(useRangeDate && { startDate: new Date(startDate).toISOString() }),
      completed: task?.completed || false,
      inProgress: task?.inProgress || false,
      color: color === "none" ? undefined : color,
      ...(isRecurring && {
        recurring: {
          frequency: recurringFrequency,
          ...(task?.recurring?.originalId && { originalId: task.recurring.originalId }),
        },
      }),
      subtasks: subtasks.length > 0 ? subtasks : undefined,
    }

    if (task) {
      updateTask(taskData)
    } else {
      addTask(taskData)
    }

    onClose()
  }

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim() === "") return

    const newSubtask: SubTask = {
      id: uuidv4(),
      title: newSubtaskTitle,
      completed: false,
    }

    setSubtasks([...subtasks, newSubtask])
    setNewSubtaskTitle("")
  }

  const handleUpdateSubtask = (id: string, title: string) => {
    setSubtasks(subtasks.map((subtask) => (subtask.id === id ? { ...subtask, title } : subtask)))
    setEditingSubtaskId(null)
  }

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter((subtask) => subtask.id !== id))
  }

  const handleToggleSubtaskCompletion = (id: string) => {
    setSubtasks(
      subtasks.map((subtask) => (subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask)),
    )
  }

  const handleToggleSubtaskProgress = (id: string) => {
    setSubtasks(
      subtasks.map((subtask) => (subtask.id === id ? { ...subtask, inProgress: !subtask.inProgress } : subtask)),
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="subtasks">Subtareas</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="details" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título de la tarea"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción de la tarea"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2 my-4">
                <Checkbox
                  id="useRangeDate"
                  checked={useRangeDate}
                  onCheckedChange={(checked) => setUseRangeDate(!!checked)}
                />
                <Label htmlFor="useRangeDate">Usar rango de fechas</Label>
              </div>

              {useRangeDate ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Fecha de inicio</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Fecha de fin</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Fecha de vencimiento</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar un color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin color</SelectItem>
                    {COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color.value }} />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRecurring"
                  checked={isRecurring}
                  onCheckedChange={(checked) => setIsRecurring(!!checked)}
                />
                <Label htmlFor="isRecurring">Tarea recurrente</Label>
              </div>

              {isRecurring && (
                <div className="space-y-2">
                  <Label htmlFor="recurringFrequency">Frecuencia</Label>
                  <Select value={recurringFrequency} onValueChange={(value: any) => setRecurringFrequency(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diaria</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </TabsContent>

            <TabsContent value="subtasks" className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <Input
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Nueva subtarea"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddSubtask()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddSubtask} disabled={newSubtaskTitle.trim() === ""}>
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Añadir
                </Button>
              </div>

              {subtasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay subtareas. Añade una nueva subtarea para comenzar.
                </div>
              ) : (
                <div className="space-y-2">
                  {subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center justify-between p-2 border rounded-md">
                      {editingSubtaskId === subtask.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            value={subtask.title}
                            onChange={(e) => handleUpdateSubtask(subtask.id, e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                setEditingSubtaskId(null)
                              }
                            }}
                          />
                          <Button type="button" size="sm" variant="ghost" onClick={() => setEditingSubtaskId(null)}>
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 flex-1">
                            <Checkbox
                              checked={subtask.completed}
                              onCheckedChange={() => handleToggleSubtaskCompletion(subtask.id)}
                            />
                            <span className={subtask.completed ? "line-through text-gray-500" : ""}>
                              {subtask.title}
                            </span>
                            {subtask.inProgress && (
                              <Badge variant="outline" className="ml-2 text-blue-600">
                                <Clock className="h-3 w-3 mr-1" />
                                En progreso
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleSubtaskProgress(subtask.id)}
                              className={subtask.inProgress ? "text-blue-600" : ""}
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingSubtaskId(subtask.id)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteSubtask(subtask.id)}
                              className="text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">{task ? "Actualizar Tarea" : "Añadir Tarea"}</Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

