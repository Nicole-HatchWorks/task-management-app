"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { FilterStatus, FilterDueDate } from "@/lib/types"

interface FilterBarProps {
  onFilterChange: (filters: { status?: FilterStatus; dueDate?: FilterDueDate }) => void
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="space-y-1 flex-1">
        <Label htmlFor="status-filter">Estado</Label>
        <Select defaultValue="all" onValueChange={(value: FilterStatus) => onFilterChange({ status: value })}>
          <SelectTrigger id="status-filter">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las tareas</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="in-progress">En progreso</SelectItem>
            <SelectItem value="completed">Completadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1 flex-1">
        <Label htmlFor="date-filter">Fecha de vencimiento</Label>
        <Select defaultValue="all" onValueChange={(value: FilterDueDate) => onFilterChange({ dueDate: value })}>
          <SelectTrigger id="date-filter">
            <SelectValue placeholder="Filtrar por fecha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las fechas</SelectItem>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="upcoming">Próximas</SelectItem>
            <SelectItem value="overdue">Vencidas</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

