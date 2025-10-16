import React from 'react';
import moment from 'moment';
import './TaskTable.css';

const TaskTable = ({ tasks, onTaskUpdate }) => {
  // Фильтруем неразобранные задачи
  const undefinedTasks = tasks.filter(task => 
    !task.importance || !task.complexity || 
    task.importance === 'undefined' || task.complexity === 'undefined' ||
    task.importance === null || task.complexity === null
  );

  // Фильтруем классифицированные задачи
  const classifiedTasks = tasks.filter(task => 
    task.importance && task.complexity && 
    task.importance !== 'undefined' && task.complexity !== 'undefined' &&
    task.importance !== null && task.complexity !== null
  );

  // Типы задач
  const taskTypes = [
    { id: 'high-high', label: 'Важно/Сложно', color: '#ef4444' },
    { id: 'high-medium', label: 'Важно/Средне', color: '#f97316' },
    { id: 'high-low', label: 'Важно/Просто', color: '#f97316' },
    { id: 'medium-high', label: 'Средне/Сложно', color: '#eab308' },
    { id: 'medium-medium', label: 'Средне/Средне', color: '#eab308' },
    { id: 'medium-low', label: 'Средне/Просто', color: '#eab308' },
    { id: 'low-high', label: 'Минимум/Сложно', color: '#22c55e' },
    { id: 'low-medium', label: 'Минимум/Средне', color: '#22c55e' },
    { id: 'low-low', label: 'Минимум/Просто', color: '#22c55e' }
  ];

  // Месяцы для таймлайна
  const months = [
    { key: 'october', label: 'Октябрь', start: moment().month(9).startOf('month') },
    { key: 'november', label: 'Ноябрь', start: moment().month(10).startOf('month') },
    { key: 'december', label: 'Декабрь', start: moment().month(11).startOf('month') }
  ];

  // Группируем задачи по типам и месяцам
  const getTasksForTypeAndMonth = (typeId, monthKey) => {
    return classifiedTasks.filter(task => {
      const taskType = `${task.importance}-${task.complexity}`;
      const taskMonth = moment(task.startDate).month();
      const targetMonth = moment().month(months.find(m => m.key === monthKey).start.month());
      
      return taskType === typeId && taskMonth === targetMonth.month();
    });
  };

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('application/json', JSON.stringify(task));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, typeId, monthKey) => {
    e.preventDefault();
    try {
      const taskData = JSON.parse(e.dataTransfer.getData('application/json'));
      const [importance, complexity] = typeId.split('-');
      const monthStart = months.find(m => m.key === monthKey).start;
      
      const updatedTask = {
        ...taskData,
        importance: importance,
        complexity: complexity,
        startDate: monthStart.toISOString(),
        endDate: monthStart.clone().add(1, 'week').toISOString()
      };
      
      onTaskUpdate(updatedTask);
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div className="task-table">
      <table>
        <thead>
          <tr>
            <th className="unsorted-header">Неразобранное</th>
            <th className="type-header">Тип важности</th>
            {months.map(month => (
              <th key={month.key} className="month-header">{month.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {taskTypes.map((type, index) => (
            <tr key={type.id}>
              <td className="unsorted-cell">
                {index === 0 && (
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
                )}
              </td>
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
                      <div key={task.id} className="task-item placed">
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
  );
};

export default TaskTable;
