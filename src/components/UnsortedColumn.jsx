import React from 'react';
import './UnsortedColumn.css';

const UnsortedColumn = ({ tasks, onTaskUpdate }) => {
  // Фильтруем неразобранные задачи
  const undefinedTasks = tasks.filter(task => 
    !task.importance || !task.complexity || 
    task.importance === 'undefined' || task.complexity === 'undefined' ||
    task.importance === null || task.complexity === null
  );

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('application/json', JSON.stringify(task));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="unsorted-column">
      <div className="unsorted-header">
        <h3>Неразобранное</h3>
        <span className="task-count">{undefinedTasks.length}</span>
      </div>
      <div className="unsorted-tasks">
        {undefinedTasks.map(task => (
          <div
            key={task.id}
            className="task-item"
            draggable
            onDragStart={(e) => handleDragStart(e, task)}
            title={task.description || task.title}
          >
            {task.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnsortedColumn;
