import { Seo } from "@/components/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTasks } from "@/context/TasksContext";

const Lists = () => {
  const { tasks, categories } = useTasks();
  const counts = (cat: string) => tasks.filter((t) => t.category === cat && !t.completed).length;

  return (
    <div className="px-4 py-6 md:px-6">
      <Seo title="TaskFlow – Lists" description="Browse your task lists by category with counts." />
      <h1 className="text-2xl font-semibold mb-4">TaskFlow Lists</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Card key={c} className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">{c}</CardTitle>
              <Badge variant="secondary">{counts(c)}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Pending tasks in {c}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Lists;
