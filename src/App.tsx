import { useState } from "react";
import AddTask from "./components/AddTask";
import TaskList from "./components/TaskList";
import "./index.css";

type FilterType = "all" | "pending" | "done";

function App() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  return (
    <>
      <header className="flex justify-center items-start p-6">
        <h1 className="text-3xl font-bold">My Tasks</h1>
      </header>

      <main className="flex flex-col justify-center items-center space-y-8 w-full">
          <AddTask />

        <div className="w-full max-w-6xl">
          <div className="flex gap-4  p-4 rounded-t-lg font-semibold justify-center">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeFilter === "all"
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setActiveFilter("pending")}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeFilter === "pending"
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveFilter("done")}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeFilter === "done"
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Done
            </button>
          </div>
          <TaskList filter={activeFilter} />
        </div>
      </main>
    </>
  );
}

export default App;
