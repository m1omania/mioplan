import React from 'react';
import moment from 'moment';

const CriticalTaskIndicator = ({ task }) => {
  // Проверяем, является ли задача критической (сроки истекают через 3 дня)
  const isCritical = () => {
    if (!task.endDate) return false;
    
    const endDate = moment(task.endDate);
    const now = moment();
    const daysUntilEnd = endDate.diff(now, 'days');
    
    return daysUntilEnd <= 3 && daysUntilEnd >= 0;
  };

  // Проверяем, просрочена ли задача
  const isOverdue = () => {
    if (!task.endDate) return false;
    
    const endDate = moment(task.endDate);
    const now = moment();
    
    return endDate.isBefore(now);
  };

  const getDaysUntilEnd = () => {
    if (!task.endDate) return null;
    
    const endDate = moment(task.endDate);
    const now = moment();
    
    return endDate.diff(now, 'days');
  };

  const critical = isCritical();
  const overdue = isOverdue();
  const daysLeft = getDaysUntilEnd();

  if (!critical && !overdue) {
    return null;
  }

  return (
    <div className={`critical-indicator ${overdue ? 'overdue' : 'critical'}`}>
      {overdue ? (
        <span className="overdue-label">ПРОСРОЧЕНО</span>
      ) : (
        <span className="critical-label">
          {daysLeft === 0 ? 'Сегодня последний день!' : `Осталось ${daysLeft} дней`}
        </span>
      )}
    </div>
  );
};

export default CriticalTaskIndicator;