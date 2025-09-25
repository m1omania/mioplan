import React from 'react';

const TaskCard = ({ task }) => {
  // Функция для определения класса важности
  const getImportanceClass = (importance) => {
    switch (importance) {
      case 'high': return 'high-important';
      case 'medium': return 'medium-important';
      case 'low': return 'low-important';
      default: return '';
    }
  };

  // Функция для определения класса сложности
  const getComplexityClass = (complexity) => {
    switch (complexity) {
      case 'high': return 'high-complexity';
      case 'medium': return 'medium-complexity';
      case 'low': return 'low-complexity';
      default: return '';
    }
  };

  return (
    <div className={`task-card ${getImportanceClass(task.importance)} ${getComplexityClass(task.complexity)}`}>
      <div className="task-title">{task.title}</div>
      <div className="task-description">{task.description}</div>
      {task.tags && task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
