import type { TaskData } from "@/types/Task";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const BASE_URL = "http://localhost:3001/task";

export const useFetchTasks = () => {
  return useQuery({
    queryKey: ["task"],
    queryFn: async () => {
      return axios.get<TaskData[]>(BASE_URL).then((res) => res.data);
    },
  });
};

export async function createTask(task: Omit<TaskData, "id">) {
  const res = await fetch("http://localhost:3001/task", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

export async function editTask(task: TaskData) {
  const res = await fetch(`http://localhost:3001/task/${task.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Failed to edit task");
  return res.json();
}
export async function deleteTask(id: string | number) {
  const res = await fetch(`http://localhost:3001/task/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete task");
  return res.json();
}
