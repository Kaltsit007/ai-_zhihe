import { PageHeader } from "@/components/page-header";
import { TaskForm } from "@/components/task-form";

export default function NewTaskPage() {
  return (
    <div>
      <PageHeader
        eyebrow="New task"
        title="发布一条委托"
        description="把时间、地点、人数和要求写清楚，别人才能判断能不能帮上忙。"
      />
      <TaskForm />
    </div>
  );
}
