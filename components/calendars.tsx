"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronRight } from "lucide-react"

interface CalendarGroup {
  name: string
  items: string[]
}

interface CalendarsProps {
  calendars: CalendarGroup[]
}

export function Calendars({ calendars }: CalendarsProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(calendars.map((cal) => [cal.name, true])),
  )

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Calendars</h2>

      <div className="space-y-4">
        {calendars.map((group) => (
          <div key={group.name} className="space-y-2">
            <button
              className="flex items-center gap-1 text-sm font-medium w-full text-left"
              onClick={() => toggleGroup(group.name)}
            >
              {expandedGroups[group.name] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              {group.name}
            </button>

            {expandedGroups[group.name] && (
              <div className="ml-6 space-y-2">
                {group.items.map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <Checkbox id={`calendar-${item}`} defaultChecked />
                    <Label htmlFor={`calendar-${item}`} className="text-sm">
                      {item}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

