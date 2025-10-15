import React from 'react';

const Header = ({ tasks = [] }) => {
  const totalTasks = tasks.length;
  const highPriorityTasks = tasks.filter(task => task.importance === 'high').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon">M</div>
          <span>MioPlan Timeline</span>
        </div>
        
        <div className="stats">
          <div className="stat">
            <div className="stat-number">{totalTasks}</div>
            <div className="stat-label">Всего задач</div>
          </div>
          <div className="stat">
            <div className="stat-number">{highPriorityTasks}</div>
            <div className="stat-label">Важных</div>
          </div>
          <div className="stat">
            <div className="stat-number">{completedTasks}</div>
            <div className="stat-label">Выполнено</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
