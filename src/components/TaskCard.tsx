import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import DeleteIcon from "../Icons/DeleteIcon";
import { Task, Id } from "../types";

interface Props {
  task: Task;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
}

function TaskCard({ task, deleteTask, updateTask }: Props) {
  const [mouseIsOver, setMouseIsOver] = useState(false);

  const [editMode, setEditMode] = useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: editMode,
  });

  const styles = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={styles}
        className="opacity-30 bg-mainBackgroundColor p-2.5 min-h-[70px]  items-center flex text-left rounded-xl border-2 border-purple-500  cursor-grab relative"
      />
    );
  }

  if (editMode) {
    return (
      <div
        ref={setNodeRef}
        style={styles}
        {...attributes}
        {...listeners}
        className="bg-mainBackgroundColor p-2.5 min-h-[70px]  items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-offset-purple-500 cursor-grab relative"
      >
        <textarea
          className="h-90% w-full resize-none border-none rounded bg-transparent focus:outline-none"
          value={task.content}
          autoFocus
          placeholder="Task content here"
          onBlur={toggleEditMode}
          onKeyDown={(e) => {
            if (e.key !== "Enter" && e.shiftKey) toggleEditMode();
          }}
          onChange={(e) => updateTask(task.id, e.target.value)}
        ></textarea>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={styles}
      {...attributes}
      {...listeners}
      onClick={toggleEditMode}
      className="bg-mainBackgroundColor p-2.5 min-h-[70px]  items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-offset-purple-500 cursor-grab relative"
      key={task.id}
      onMouseEnter={() => {
        setMouseIsOver(true);
      }}
      onMouseLeave={() => {
        setMouseIsOver(false);
      }}
    >
      <p className="my-auto h-[90%] w-full overflow-y-auto whitespace-pre-wrap">
        {task.content}
      </p>
      {mouseIsOver && (
        <button
          onClick={() => {
            deleteTask(task.id);
          }}
          className="stroke-white absolute right-2 top-1/2 -translate-y-1/2 bg-columnBackgroundColor p-2 rounded opacity-60 hover:opacity-100"
        >
          <DeleteIcon />
        </button>
      )}
    </div>
  );
}

export default TaskCard;
