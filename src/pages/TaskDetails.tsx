import { useParams, useNavigate } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTasks, Priority } from "@/context/TasksContext";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarDays } from "lucide-react";

const TaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, categories, updateTask, deleteTask } = useTasks();
  const task = useMemo(() => tasks.find((t) => t.id === id), [tasks, id]);

  const [title, setTitle] = useState(task?.title ?? "");
  const [category, setCategory] = useState(task?.category ?? categories[0] ?? "Work");
  const [priority, setPriority] = useState<Priority>((task?.priority as Priority) ?? "Medium");
  const [dueDate, setDueDate] = useState<Date | undefined>(task?.dueDate ? parseISO(task.dueDate) : undefined);
  const [notes, setNotes] = useState(task?.notes ?? "");

  if (!task) {
    return (
      <div className="px-4 py-6 md:px-6">
        <Seo title="TaskFlow – Task not found" />
        <p className="text-sm text-muted-foreground">Task not found.</p>
      </div>
    );
  }

  const onSave = () => {
    updateTask(task.id, {
      title: title.trim(),
      category,
      priority,
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
      notes: notes.trim() || undefined,
    });
    navigate(-1);
  };

  const onDelete = () => {
    deleteTask(task.id);
    navigate(-1);
  };

  return (
    <div className="px-4 py-6 md:px-6">
      <Seo title={`TaskFlow – ${task.title}`} description={task.notes} />
      <h1 className="text-2xl font-semibold mb-4">TaskFlow – Edit Task</h1>
      <div className="grid gap-4 max-w-2xl">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {(["Low", "Medium", "High"] as Priority[]).map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Due date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start gap-2">
                <CalendarDays />
                {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="destructive" onClick={onDelete}>Delete</Button>
          <Button variant="cta" onClick={onSave}>Save</Button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
