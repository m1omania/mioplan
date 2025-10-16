import React, { useState } from 'react';
import './UnsortedColumn.css';

const UnsortedColumn = ({ tasks, onTaskUpdate }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  
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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // Проверяем, что мы действительно покидаем контейнер
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const taskData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      // Сбрасываем importance и complexity, чтобы задача стала неразобранной
      const updatedTask = {
        ...taskData,
        importance: null,
        complexity: null,
        startDate: null,
        endDate: null
      };
      
      onTaskUpdate(updatedTask);
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  return (
    <div 
      className={`unsorted-column ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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
