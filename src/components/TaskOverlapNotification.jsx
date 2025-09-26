import React, { useState, useEffect } from 'react';

const TaskOverlapNotification = ({ tasks }) => {
  const [overlappingTasks, setOverlappingTasks] = useState([]);

  useEffect(() => {
    // Проверяем пересечения задач
    const overlaps = [];
    
    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        const task1 = tasks[i];
        const task2 = tasks[j];
        
        // Проверяем, находятся ли задачи в одном секторе
        if (
          task1.importance === task2.importance && 
          task1.complexity === task2.complexity
        ) {
          // Проверяем пересечение по времени
          const start1 = new Date(task1.startDate);
          const end1 = new Date(task1.endDate);
          const start2 = new Date(task2.startDate);
          const end2 = new Date(task2.endDate);
          
          if (
            (start1 <= start2 && start2 <= end1) || 
            (start1 <= end2 && end2 <= end1) ||
            (start2 <= start1 && end1 <= end2)
          ) {
            overlaps.push({
              task1: task1,
              task2: task2
            });
          }
        }
      }
    }
    
    setOverlappingTasks(overlaps);
  }, [tasks]);

  if (overlappingTasks.length === 0) {
    return null;
  }

  return (
    <div className="overlap-notifications">
      {overlappingTasks.slice(0, 3).map((overlap, index) => (
        <div key={index} className="overlap-notification">
          <span className="warning-icon">⚠️</span>
          <span>
            Задачи "{overlap.task1.title}" и "{overlap.task2.title}" пересекаются по времени в секторе {overlap.task1.importance}/{overlap.task1.complexity}
          </span>
        </div>
      ))}
      {overlappingTasks.length > 3 && (
        <div className="overlap-notification">
          <span>И еще {overlappingTasks.length - 3} пересечений...</span>
        </div>
      )}
    </div>
  );
};

export default TaskOverlapNotification;