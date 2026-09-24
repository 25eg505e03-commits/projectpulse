import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { taskService } from '../../services/api';
import { Plus } from 'lucide-react';

const COLUMNS = [
  { id: 'todo', title: 'TODO', badgeClass: 'badge-todo' },
  { id: 'in-progress', title: 'IN PROGRESS', badgeClass: 'badge-in-progress' },
  { id: 'review', title: 'REVIEW', badgeClass: 'badge-review' },
  { id: 'done', title: 'DONE', badgeClass: 'badge-done' },
];

const KanbanBoard = ({ tasks = [], onTaskUpdate, onTaskClick, onCreateTask }) => {
  const [boardTasks, setBoardTasks] = useState(tasks);

  useEffect(() => {
    setBoardTasks(tasks);
  }, [tasks]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside or in same spot
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    const oldTasks = [...boardTasks];

    // Optimistic UI Update
    const updatedTasks = boardTasks.map((task) =>
      task._id === draggableId ? { ...task, status: newStatus } : task
    );
    setBoardTasks(updatedTasks);

    // Call Backend API
    try {
      const { data } = await taskService.updateTaskStatus(draggableId, newStatus);
      if (data.success && onTaskUpdate) {
        onTaskUpdate(data.data);
      }
    } catch (error) {
      console.error('Failed to update task status on server:', error);
      // Rollback on error
      setBoardTasks(oldTasks);
    }
  };

  const getColumnTasks = (columnId) => {
    return boardTasks.filter((task) => task.status === columnId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colTasks = getColumnTasks(col.id);
          return (
            <div
              key={col.id}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${col.badgeClass}`}>
                    {col.title}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>
                {onCreateTask && (
                  <button
                    onClick={() => onCreateTask(col.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Droppable Column Area */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 space-y-3 transition-colors rounded-xl p-1 ${
                      snapshot.isDraggingOver ? 'bg-sky-950/20 border border-dashed border-sky-500/40' : ''
                    }`}
                  >
                    {colTasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.9 : 1,
                            }}
                          >
                            <TaskCard task={task} onClick={() => onTaskClick(task)} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
