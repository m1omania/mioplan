import React from 'react';
import { useDrop } from 'react-dnd';
import DraggableTaskCard from './DraggableTaskCard';

const MatrixCell = ({ 
  importance, 
  complexity, 
  title, 
  tasks, 
  onTaskMove,
  cellClass
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'task',
    drop: (item) => {
      if (item.importance !== importance || item.complexity !== complexity) {
        onTaskMove(item.id, importance, complexity);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div 
      ref={drop} 
      className={cellClass}
      style={{
        backgroundColor: isOver ? '#f0f0f0' : 'inherit',
      }}
    >
      <div className="cell-header">{title}</div>
      {tasks && tasks.map(task => (
        <DraggableTaskCard 
          key={task.id} 
          task={task} 
        />
      ))}
    </div>
  );
};

export default MatrixCell;
