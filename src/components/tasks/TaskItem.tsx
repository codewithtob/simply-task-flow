import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/context/TasksContext";

export function TaskItem({ task, selected, onToggleSelect }: {
  task: Task;
  selected: boolean;
  onToggleSelect: () => void;
}) {
  return (
    <li className="flex items-center justify-between rounded-lg border bg-card p-3">
      <div className="flex items-center gap-3">
        <Checkbox checked={selected} onCheckedChange={onToggleSelect} aria-label="Select task" />
        <div>
          <Link to={`/task/${task.id}`} className="font-medium hover:underline">
            {task.title}
          </Link>
          <div className="text-xs text-muted-foreground">
            {task.category} • {task.priority}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {task.completed && <Badge variant="outline">Done</Badge>}
      </div>
    </li>
  );
}
