import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Task } from "@/context/TasksContext";
import { useTasks } from "@/context/TasksContext";
import { TaskItem } from "./TaskItem";

export function TaskList({ tasks }: { tasks: Task[] }) {
  const { toggleComplete, deleteTask } = useTasks();
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const selectedIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected]);

  const toggleSelect = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const onBulkComplete = () => {
    selectedIds.forEach((id) => toggleComplete(id));
    setSelected({});
  };

  const onBulkDelete = () => {
    selectedIds.forEach((id) => deleteTask(id));
    setSelected({});
  };

  return (
    <div className="space-y-2">
      {selectedIds.length > 0 && (
        <div className="sticky top-14 z-10 flex items-center gap-2 rounded-md border bg-muted/50 p-2">
          <span className="text-sm">{selectedIds.length} selected</span>
          <Button size="sm" variant="cta" onClick={onBulkComplete}>Complete</Button>
          <Button size="sm" variant="destructive" onClick={onBulkDelete}>Delete</Button>
        </div>
      )}

      <ul className="grid gap-2">
        {tasks.map((t) => (
          <TaskItem key={t.id} task={t} selected={!!selected[t.id]} onToggleSelect={() => toggleSelect(t.id)} />
        ))}
      </ul>
    </div>
  );
}
