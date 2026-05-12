"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: "exam" | "holiday" | "activity" | "meeting" | "fee";
  description?: string;
}

const eventColors: Record<string, string> = {
  exam: "bg-red-100 text-red-700 border-red-200",
  holiday: "bg-purple-100 text-purple-700 border-purple-200",
  activity: "bg-blue-100 text-blue-700 border-blue-200",
  meeting: "bg-amber-100 text-amber-700 border-amber-200",
  fee: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

interface AcademicCalendarProps {
  events?: CalendarEvent[];
}

export function AcademicCalendar({ events = [] }: AcademicCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: (number | null)[] = [];
    
    // Add empty slots for days before the first day
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.date === dateStr);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Academic Calendar
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Day names */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayEvents = day ? getEventsForDate(day) : [];
            const isToday = day === new Date().getDate() && 
              currentDate.getMonth() === new Date().getMonth() && 
              currentDate.getFullYear() === new Date().getFullYear();
            
            return (
              <div
                key={index}
                className={`min-h-[60px] p-1 border rounded-md ${
                  day ? "hover:bg-slate-50 cursor-pointer" : "bg-slate-50/50"
                } ${isToday ? "border-emerald-500 bg-emerald-50" : "border-slate-200"}`}
                onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium ${isToday ? "text-emerald-600" : "text-slate-700"}`}>
                      {day}
                    </div>
                    {dayEvents.length > 0 && (
                      <div className="space-y-0.5 mt-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-[10px] px-1 py-0.5 rounded truncate ${eventColors[event.type] || "bg-slate-100"}`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[10px] text-slate-500">+{dayEvents.length - 2} more</div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Selected date events */}
        {selectedDate && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">
              Events on {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </h4>
            {getEventsForDate(selectedDate.getDate()).length === 0 ? (
              <p className="text-sm text-slate-500">No events scheduled</p>
            ) : (
              <div className="space-y-2">
                {getEventsForDate(selectedDate.getDate()).map(event => (
                  <div key={event.id} className="flex items-start gap-2 p-2 bg-slate-50 rounded-md">
                    <Badge className={eventColors[event.type]}>{event.type}</Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      {event.time && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </div>
                      )}
                      {event.description && (
                        <p className="text-xs text-slate-500 mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}