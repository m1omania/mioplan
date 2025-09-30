import React from 'react';
import { useDrag } from 'react-dnd';
import TaskCard from './TaskCard';

const DraggableTaskCard = ({ task }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { id: task.id, importance: task.importance, complexity: task.complexity },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
    >
      <TaskCard task={task} />
    </div>
  );
};

export default DraggableTaskCard;
