export interface TaskData {
  id: number | string;
  title: string;
  dueDate: string;
  status: "Pending" | "Done";
}
