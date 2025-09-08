import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useTasks } from "@/context/TasksContext";
import { CheckCircle2, Flame, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";
import { format, subDays } from "date-fns";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

const Stat = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) => (
  <Card className="hover-scale">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      <Icon className="h-4 w-4 text-primary" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-semibold">{value}</div>
    </CardContent>
  </Card>
);

const Index = () => {
  const { tasks, todayTasks, toggleComplete, streak } = useTasks();

  const chartData = Array.from({ length: 14 }).map((_, i) => {
    const d = subDays(new Date(), 13 - i);
    const key = d.toISOString().slice(0, 10);
    const count = tasks.filter((t) => t.completedAt && (t.completedAt as string).slice(0, 10) === key).length;
    return { date: format(d, "MM/dd"), count };
  });

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 py-6 md:px-6 bg-[var(--gradient-subtle)]">
      <Seo title="TaskFlow – Minimal To‑Do App" description="Organize tasks with clarity. Quick add, lists, search, and delightful interactions." />

      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">TaskFlow Today</h1>
        <p className="text-muted-foreground">Stay focused. You got this.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat icon={ListChecks} label="Tasks" value={tasks.length} />
        <Stat icon={CheckCircle2} label="Due Today" value={todayTasks.length} />
        <Stat icon={Flame} label="Streak" value={`${streak} 🔥`} />
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Completed tasks (last 14 days)</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-medium mb-3">Today's tasks</h2>
        <div className="space-y-2">
          {todayTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks for today. Add one with the + button.</p>
          ) : (
            todayTasks.map((t) => (
              <Card key={t.id} className="hover-scale-subtle">
                <CardContent className="flex items-start gap-3 p-4">
                  <Checkbox checked={t.completed} onCheckedChange={() => toggleComplete(t.id)} />
                  <div className="flex-1">
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{t.category} • {t.priority}{t.notes ? ` • ${t.notes}` : ""}</div>
                  </div>
                  <Button asChild variant="ghost" size="sm"><Link to={`/task/${t.id}`}>Details</Link></Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
