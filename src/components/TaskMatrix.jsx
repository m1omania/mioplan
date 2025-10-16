import React from 'react';
import './TaskMatrix.css';

const TaskMatrix = ({ tasks, onTaskUpdate }) => {
  // Фильтруем классифицированные задачи
  const classifiedTasks = tasks.filter(task => 
    task.importance && task.complexity && 
    task.importance !== 'undefined' && task.complexity !== 'undefined' &&
    task.importance !== null && task.complexity !== null
  );

  // Типы задач для таблицы
  const taskTypes = [
    { id: 'high-high', label: 'Важно/Сложно', color: '#ef4444' },
    { id: 'high-medium', label: 'Важно/Средне', color: '#f97316' },
    { id: 'high-low', label: 'Важно/Просто', color: '#eab308' },
    { id: 'medium-high', label: 'Средне/Сложно', color: '#3b82f6' },
    { id: 'medium-medium', label: 'Средне/Средне', color: '#6366f1' },
    { id: 'medium-low', label: 'Средне/Просто', color: '#8b5cf6' },
    { id: 'low-high', label: 'Минимум/Сложно', color: '#22c55e' },
    { id: 'low-medium', label: 'Минимум/Средне', color: '#22c55e' },
    { id: 'low-low', label: 'Минимум/Просто', color: '#22c55e' }
  ];

  // Месяцы для таймлайна (13 месяцев: октябрь + 12 месяцев вперед)
  const months = [];
  let currentMonth = new Date();
  currentMonth.setMonth(9); // Октябрь
  currentMonth.setDate(1);
  
  for (let i = 0; i < 13; i++) {
    const monthKey = currentMonth.toISOString().substring(0, 7); // YYYY-MM
    const monthLabel = currentMonth.toLocaleDateString('ru-RU', { 
      month: 'long', 
      year: 'numeric' 
    });
    
    months.push({
      key: monthKey,
      label: monthLabel,
      start: new Date(currentMonth),
      end: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
    });
    
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }

  // Группируем задачи по типам и месяцам
  const getTasksForTypeAndMonth = (typeId, monthKey) => {
    return classifiedTasks.filter(task => {
      const taskType = `${task.importance}-${task.complexity}`;
      const taskMonth = new Date(task.startDate).toISOString().substring(0, 7);
      return taskType === typeId && taskMonth === monthKey;
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, typeId, monthKey) => {
    e.preventDefault();
    try {
      const taskData = JSON.parse(e.dataTransfer.getData('application/json'));
      const [importance, complexity] = typeId.split('-');
      
      const targetMonth = months.find(m => m.key === monthKey);
      if (!targetMonth) {
        console.error('Target month not found:', monthKey);
        return;
      }

      const dropTime = new Date(targetMonth.start);
      
      const updatedTask = {
        ...taskData,
        importance: importance,
        complexity: complexity,
        startDate: dropTime.toISOString(),
        endDate: new Date(dropTime.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() // +1 неделя
      };
      
      onTaskUpdate(updatedTask);
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  return (
    <div className="task-matrix">
      <div className="matrix-container">
        <table>
          <thead>
            <tr>
              <th className="type-header">Тип важности</th>
              {months.map(month => (
                <th key={month.key} className="month-header">{month.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {taskTypes.map((type) => (
              <tr key={type.id}>
                <td className="type-cell">
                  <div className="type-item" style={{ borderLeftColor: type.color }}>
                    <div className="type-color" style={{ backgroundColor: type.color }} />
                    <span className="type-label">{type.label}</span>
                  </div>
                </td>
                {months.map(month => (
                  <td 
                    key={month.key} 
                    className="month-cell"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, type.id, month.key)}
                  >
                    <div className="month-tasks">
                      {getTasksForTypeAndMonth(type.id, month.key).map(task => (
                        <div 
                          key={task.id} 
                          className="task-item placed"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('application/json', JSON.stringify(task));
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          title={task.description || task.title}
                        >
                          {task.title}
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskMatrix;
