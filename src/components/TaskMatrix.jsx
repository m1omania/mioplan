import React, { useState, useRef } from 'react';
import './TaskMatrix.css';

const TaskMatrix = ({ tasks, onTaskUpdate }) => {
  const [zoomLevel, setZoomLevel] = useState(1); // Плавный зум от 1 до 3
  const matrixRef = useRef(null);

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

  // Обработчик плавного зума
  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel(prev => {
        const newLevel = prev + delta;
        return Math.max(1, Math.min(3, newLevel)); // Плавный зум от 1 до 3
      });
    }
  };

  // Генерация колонок с плавным зумом
  const generateColumns = () => {
    const columns = [];
    let currentDate = new Date();
    currentDate.setMonth(9); // Октябрь
    currentDate.setDate(1);
    
    // Количество месяцев для отображения (уменьшается при зуме)
    const monthsToShow = Math.max(1, Math.floor(13 / zoomLevel));
    
    for (let i = 0; i < monthsToShow; i++) {
      if (zoomLevel <= 1.5) {
        // Месячный вид (1.0 - 1.5)
        const monthKey = currentDate.toISOString().substring(0, 7);
        const monthLabel = currentDate.toLocaleDateString('ru-RU', { 
          month: 'long', 
          year: 'numeric' 
        });
        
        columns.push({
          key: monthKey,
          label: monthLabel,
          start: new Date(currentDate),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
          type: 'month',
          width: Math.max(80, 200 / zoomLevel) // Адаптивная ширина
        });
      } else if (zoomLevel <= 2.5) {
        // Недельный вид (1.5 - 2.5)
        const startOfMonth = new Date(currentDate);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        let weekStart = new Date(startOfMonth);
        const weeksInMonth = Math.ceil((endOfMonth.getDate() - startOfMonth.getDate() + 1) / 7);
        
        for (let week = 0; week < weeksInMonth; week++) {
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          const weekKey = `${currentDate.toISOString().substring(0, 7)}-W${week + 1}`;
          const weekLabel = `Н${week + 1}`;
          
          columns.push({
            key: weekKey,
            label: weekLabel,
            start: new Date(weekStart),
            end: new Date(weekEnd),
            type: 'week',
            width: Math.max(60, 120 / zoomLevel)
          });
          
          weekStart.setDate(weekStart.getDate() + 7);
        }
      } else {
        // Дневной вид (2.5+)
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const daysToShow = Math.min(daysInMonth, Math.floor(31 / zoomLevel));
        
        for (let day = 1; day <= daysToShow; day++) {
          const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dayKey = dayDate.toISOString().substring(0, 10);
          const dayLabel = day.toString();
          
          columns.push({
            key: dayKey,
            label: dayLabel,
            start: new Date(dayDate),
            end: new Date(dayDate.getTime() + 24 * 60 * 60 * 1000),
            type: 'day',
            width: Math.max(40, 80 / zoomLevel)
          });
        }
      }
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return columns;
  };

  const columns = generateColumns();

  // Группируем задачи по типам и колонкам
  const getTasksForTypeAndColumn = (typeId, columnKey) => {
    return classifiedTasks.filter(task => {
      const taskType = `${task.importance}-${task.complexity}`;
      const taskDate = new Date(task.startDate);
      
      // Находим колонку по ключу
      const column = columns.find(col => col.key === columnKey);
      if (!column) return false;
      
      // Проверяем, попадает ли задача в диапазон колонки
      return taskType === typeId && 
             taskDate >= column.start && 
             taskDate < column.end;
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
    <div className="task-matrix" ref={matrixRef} onWheel={handleWheel}>
      <div className="matrix-container">
        <div className="zoom-indicator">
          Зум: {zoomLevel.toFixed(1)}x - {zoomLevel <= 1.5 ? 'Месяцы' : zoomLevel <= 2.5 ? 'Недели' : 'Дни'} 
          (Ctrl + колесо мыши)
        </div>
        <table>
          <thead>
            <tr>
              <th className="type-header">Тип важности</th>
              {columns.map(column => (
                <th 
                  key={column.key} 
                  className="month-header"
                  style={{ width: `${column.width}px` }}
                >
                  {column.label}
                </th>
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
                {columns.map(column => (
                  <td 
                    key={column.key} 
                    className="month-cell"
                    style={{ width: `${column.width}px` }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, type.id, column.key)}
                  >
                    <div className="month-tasks">
                      {getTasksForTypeAndColumn(type.id, column.key).map(task => (
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
