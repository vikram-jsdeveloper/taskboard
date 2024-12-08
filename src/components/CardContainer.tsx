import { useSortable } from "@dnd-kit/sortable";
import DeleteIcon from "../Icons/DeleteIcon";
import { Column, Id, Task } from "../types";
import { CSS } from "@dnd-kit/utilities";
import { useState, useMemo } from "react";
import PlusIcon from "../Icons/PlusIcon";
import TaskCard from "./TaskCard";
import { SortableContext } from "@dnd-kit/sortable";

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updatecolumn: (id: Id, title: string) => void;
  createTask: (columnId: Id) => void;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
  tasks: Task[];
}

function CardContainer(props: Props) {
  const {
    column,
    deleteColumn,
    updatecolumn,
    createTask,
    tasks,
    deleteTask,
    updateTask,
  } = props;

  const [editMode, setEditMode] = useState(false);

  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editMode,
  });

  const styles = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={styles}
        className="bg-columnBackgroundColor 
    w-[350px] h-[500px] 
    max-h-[500px] 
    overflow-y-auto 
    rounded-md flex 
    flex-col opacity-40 border-purple-400 border-2"
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={styles}
      className="bg-columnBackgroundColor 
    w-[350px] h-[500px] 
    max-h-[500px] 
    overflow-y-auto 
    rounded-md flex 
    flex-col "
    >
      {/* Column Title */}
      <div
        {...attributes}
        {...listeners}
        onClick={() => {
          setEditMode(true);
        }}
        className="bg-mainBackgroundColor
       text-md
        h-[60px]
        cursor-grab rounded-md p-3 font-bold border-columnBackgroundColor border-4 flex items-center justify-between"
      >
        {!editMode && column.title}
        {editMode && (
          <input
            className="bg-black focus:border-purple-400 border rounded outline-none px-2"
            value={column.title}
            onChange={(e) => updatecolumn(column.id, e.target.value)}
            autoFocus
            onBlur={() => {
              setEditMode(false);
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;

              setEditMode(false);
            }}
          />
        )}
        <button
          onClick={() => {
            deleteColumn(column.id);
          }}
          className="stroke-gray-500 hover:stroke-white hover:bg-columnBackgroundColor rounded px-1 py-2"
        >
          <DeleteIcon />
        </button>
      </div>
      {/* Column task container */}
      <div className="flex flex-grow flex-col p-4 gap-3 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>
      {/* Column footer */}
      <button
        onClick={() => {
          createTask(column.id);
        }}
        className="flex items-center rounded-t-none hover:bg-purple-500  hover:border-purple-500 border-2 rounded-md px-4 py-2 gap-3"
      >
        <PlusIcon />
        Add Task
      </button>
    </div>
  );
}

export default CardContainer;
