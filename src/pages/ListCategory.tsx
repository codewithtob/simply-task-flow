import { Seo } from "@/components/Seo";
import { useTasks } from "@/context/TasksContext";
import { useParams, Link } from "react-router-dom";
import { TaskList } from "@/components/tasks/TaskList";

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
      <TaskList tasks={items} />
    </div>
  );
};

export default ListCategory;
