import { Seo } from "@/components/Seo";
import { useTasks } from "@/context/TasksContext";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const ListCategory = () => {
  const { category: raw } = useParams<{ category: string }>();
  const category = decodeURIComponent(raw ?? "");
  const { tasks } = useTasks();
  const items = tasks.filter((t) => t.category === category);

  if (!raw) {
    return (
      <div className="px-4 py-6 md:px-6">
        <Seo title="TaskFlow – Category" description="Browse tasks by category" />
        <p className="text-sm text-muted-foreground">No category specified.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-6">
      <Seo title={`TaskFlow – ${category} tasks`} description={`All tasks in ${category} category`} />
      <h1 className="text-2xl font-semibold mb-4">Tasks in {category}</h1>
      <div className="mb-4">
        <Link to="/lists" className="text-sm text-muted-foreground hover:underline">&larr; Back to Lists</Link>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks in this category yet.</p>
      ) : (
        <ul className="grid gap-2">
          {items.map((t) => (
            <li key={t.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
              <Link to={`/task/${t.id}`} className="font-medium hover:underline">
                {t.title}
              </Link>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{t.priority}</Badge>
                {t.completed && <Badge variant="outline">Done</Badge>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListCategory;
