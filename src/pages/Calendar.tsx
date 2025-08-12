import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { Seo } from "@/components/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarWidget } from "@/components/ui/calendar";
import { useTasks } from "@/context/TasksContext";
import { Button } from "@/components/ui/button";

export default function CalendarPage() {
  const { tasks } = useTasks();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const dayTasks = tasks.filter((t) => t.dueDate && date && isSameDay(new Date(t.dueDate), date));

  return (
    <div className="px-4 py-6 md:px-6">
      <Seo title="TaskFlow – Calendar" description="Browse tasks by date on the calendar." />
      <h1 className="text-2xl font-semibold mb-4">Calendar</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <CalendarWidget mode="single" selected={date} onSelect={setDate} className="p-3 pointer-events-auto" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{date ? format(date, "PPP") : "Select a date"}</CardTitle>
          </CardHeader>
          <CardContent>
            {dayTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks for this date.</p>
            ) : (
              <ul className="space-y-2">
                {dayTasks.map((t) => (
                  <li key={t.id} className="rounded-md border p-3 bg-card">
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{t.category} • {t.priority}</div>
                  </li>
                ))}
              </ul>
            )}
            <Button variant="cta" className="mt-4">Add Task</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
