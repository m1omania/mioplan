import React from 'react';
import './UndefinedTasks.css';

const UndefinedTasks = ({ tasks, onTaskUpdate }) => {
  // Фильтруем задачи без определенного типа
  const undefinedTasks = tasks.filter(task => 
    !task.importance || !task.complexity || 
    task.importance === 'undefined' || task.complexity === 'undefined'
  );

  const handleTaskClick = (task) => {
    // При клике на задачу можно показать меню выбора типа
    console.log('Clicked undefined task:', task);
  };

  return (
    <div className="undefined-tasks">
      <div className="undefined-tasks-header">
        <h3>Неопределенные задачи</h3>
        <span className="task-count">{undefinedTasks.length}</span>
      </div>
      
      <div className="undefined-tasks-list">
        {undefinedTasks.length === 0 ? (
          <div className="empty-state">
            <p>Все задачи классифицированы!</p>
          </div>
        ) : (
          undefinedTasks.map(task => (
            <div
              key={task.id}
              className="undefined-task-item"
              onClick={() => handleTaskClick(task)}
              title={task.description || task.title}
            >
              <div className="task-title">{task.title}</div>
              <div className="task-meta">
                {task.tags && task.tags.length > 0 && (
                  <div className="task-tags">
                    {task.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UndefinedTasks;
