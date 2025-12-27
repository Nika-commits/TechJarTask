import { deleteTask, editTask, useFetchTasks } from "@/api/tasks.api";
import { useDebounce } from "@/hooks/useDebounce";
import type { TaskData } from "@/types/Task";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

type FilterType = "all" | "pending" | "done";

export default function TaskList({ filter }: { filter: FilterType }) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  // ============================================
  // DATA FETCHING & MUTATIONS
  // ============================================
  const { data, isLoading, error } = useFetchTasks();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task"] }),
  });

  const editMutation = useMutation({
    mutationFn: editTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task"] });
      setEditingId(null);
      setDraftTitle("");
    },
  });

  // ============================================
  // EVENT HANDLERS
  // ============================================
  const handleEdit = (task: TaskData) => {
    setEditingId(task.id!);
    setDraftTitle(task.title);
  };

  const handleSave = (taskId: string | number) => {
    const currentTasks = queryClient.getQueryData<TaskData[]>(["task"]);
    const currentTask = currentTasks?.find((t) => t.id === taskId);

    if (currentTask) {
      editMutation.mutate({ ...currentTask, title: draftTitle });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setDraftTitle("");
  };

  const handleStatusToggle = (taskId: string | number) => {
    const currentTasks = queryClient.getQueryData<TaskData[]>(["task"]);
    const currentTask = currentTasks?.find((t) => t.id === taskId);

    if (currentTask) {
      editMutation.mutate({
        ...currentTask,
        status: currentTask.status === "Done" ? "Pending" : "Done",
      });
    }
  };

  // ============================================
  // FILTERING LOGIC (Status + Search)
  // ============================================
  const filteredTasks = useMemo(() => {
    const tasks = data || [];

    return tasks.filter((task) => {
      // Filter by status
      const statusMatch =
        filter === "all" ||
        (filter === "pending" && task.status === "Pending") ||
        (filter === "done" && task.status === "Done");

      // Filter by search term (case-insensitive)
      const searchMatch =
        debouncedSearchTerm === "" ||
        task.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      return statusMatch && searchMatch;
    });
  }, [data, filter, debouncedSearchTerm]);

  // ============================================
  // LOADING & ERROR STATES
  // ============================================
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-500">
          Error loading tasks. Please try again.
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tasks..."
          className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search Results Info */}
      {debouncedSearchTerm && (
        <div className="text-sm text-gray-600">
          Found {filteredTasks.length} task(s) matching "{debouncedSearchTerm}"
        </div>
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {debouncedSearchTerm
            ? `No tasks found matching "${debouncedSearchTerm}"`
            : "No tasks found"}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isEditing = editingId === task.id;

            return (
              <div
                key={task.id}
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {isEditing ? (
                  // ============================================
                  // EDIT MODE
                  // ============================================
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave(task.id!);
                        if (e.key === "Escape") handleCancel();
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg text-gray-700 text-sm transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave(task.id!)}
                        disabled={!draftTitle.trim()}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 rounded-lg text-white text-sm transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // ============================================
                  // VIEW MODE
                  // ============================================
                  <>
                    <div className="mb-3">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                        <span
                          className={`px-2 py-1 rounded ${
                            task.status === "Done"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {task.status}
                        </span>
                        <span>Due: {task.dueDate}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleStatusToggle(task.id!)}
                        className={`px-4 py-2 rounded-lg text-white text-sm transition-colors ${
                          task.status === "Done"
                            ? "bg-gray-400 hover:bg-gray-500"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {task.status === "Done" ? "Mark Pending" : "Mark Done"}
                      </button>
                      <button
                        onClick={() => handleEdit(task)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(task.id!)}
                        disabled={deleteMutation.isPending}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded-lg text-white text-sm transition-colors"
                      >
                        {deleteMutation.isPending ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
