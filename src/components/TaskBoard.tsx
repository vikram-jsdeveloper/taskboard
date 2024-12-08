import { useMemo, useState } from "react";
import PlusIcon from "../Icons/PlusIcon";
import { Column, Id, Task } from "../types";
import CardContainer from "./CardContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

function TaskBoard() {
  const [columns, setColumns] = useState<Column[]>([]);

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [tasks, setTasks] = useState<Task[]>([]);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Configure PointerSensor with activation constraint
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 3, // 3px
    },
  });

  // Register the sensor
  const sensors = useSensors(pointerSensor);

  console.log(columns);

  function createNewColumn() {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Card ${columns.length + 1}`,
    };

    setColumns([...columns, columnToAdd]);
  }

  function deleteColumnFunc(id: Id) {
    const filteredColumns = columns.filter((col) => col.id !== id);
    setColumns(filteredColumns);

    const newTasks = tasks.filter((t) => t.columnId !== id);
    setTasks(newTasks);
  }

  function updatecolumnFunc(id: Id, title: string) {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });
    setColumns(newColumns);
  }

  function createTaskFunc(columnId: Id) {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`,
    };

    setTasks([...tasks, newTask]);
  }

  function deleteTaskFunc(id: Id) {
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
  }

  function updateTaskFunc(id: Id, content: string) {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, content };
    });

    setTasks(newTasks);
  }

  function onDragStartFunc(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEndFunc(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

    const activeColumnId = active.id;

    const overColumnId = over.id;

    if (activeColumnId === overColumnId) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (col) => col.id === activeColumnId
      );

      const overColumnIndex = columns.findIndex(
        (col) => col.id === overColumnId
      );

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOverFunc(event: DragOverEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;

    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // I am Droping a Task over another Task

    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        tasks[activeIndex].columnId = tasks[overIndex].columnId;

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    //I am dropping a Task over a column

    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columnId = overId;

        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }

  return (
    <div className="m-auto flex min-h-screen w-full items-center  overflow-x-auto overflow-y-hidden px-[40px]">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStartFunc}
        onDragEnd={onDragEndFunc}
        onDragOver={onDragOverFunc}
      >
        <div className="m-auto flex gap-2">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map((col) => {
                return (
                  <CardContainer
                    key={col.id}
                    column={col}
                    deleteColumn={deleteColumnFunc}
                    updatecolumn={updatecolumnFunc}
                    createTask={createTaskFunc}
                    deleteTask={deleteTaskFunc}
                    updateTask={updateTaskFunc}
                    tasks={tasks.filter((task) => task.columnId === col.id)}
                  />
                );
              })}
            </SortableContext>
          </div>
          <button
            onClick={() => {
              createNewColumn();
            }}
            className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-3 border-columnBackgroundColor p-4 ring-purple-500 hover:ring-2 flex gap-5 items-center justify-center"
          >
            <PlusIcon />
            Add Column
          </button>
        </div>
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <CardContainer
                column={activeColumn}
                deleteColumn={deleteColumnFunc}
                updatecolumn={updatecolumnFunc}
                createTask={createTaskFunc}
                deleteTask={deleteTaskFunc}
                updateTask={updateTaskFunc}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTaskFunc}
                updateTask={updateTaskFunc}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}

function generateId() {
  /*Generate a random number between 0 and 10000*/
  return Math.floor(Math.random() * 10001);
}

export default TaskBoard;
