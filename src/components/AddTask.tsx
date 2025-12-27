import { createTask } from "@/api/tasks.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

function AddTask() {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task"] });
      setTitle("");
      setDueDate("");
    },
  });

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;
    mutation.mutate({
      title,
      dueDate,
      status: "Pending",
    });
  };

  return (
    <div className="flex w-1/2 justify-center gap-3 items-center p-5">
      <input
        type="text"
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-2xl"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-2xl"
      />
      <button
        onClick={handleSubmit}
        className="px-6 py-2  bg-black text-white rounded-2xl hover:bg-gray-700"
      >
        Add
      </button>
    </div>
  );
}

export default AddTask;
