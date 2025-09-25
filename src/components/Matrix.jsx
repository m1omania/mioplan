import React from 'react';
import TaskCard from './TaskCard';

const Matrix = ({ tasks }) => {
  // Группируем задачи по важности и сложности
  const groupedTasks = {
    'high-high': tasks.filter(task => task.importance === 'high' && task.complexity === 'high'),
    'high-medium': tasks.filter(task => task.importance === 'high' && task.complexity === 'medium'),
    'high-low': tasks.filter(task => task.importance === 'high' && task.complexity === 'low'),
    'medium-high': tasks.filter(task => task.importance === 'medium' && task.complexity === 'high'),
    'medium-medium': tasks.filter(task => task.importance === 'medium' && task.complexity === 'medium'),
    'medium-low': tasks.filter(task => task.importance === 'medium' && task.complexity === 'low'),
    'low-high': tasks.filter(task => task.importance === 'low' && task.complexity === 'high'),
    'low-medium': tasks.filter(task => task.importance === 'low' && task.complexity === 'medium'),
    'low-low': tasks.filter(task => task.importance === 'low' && task.complexity === 'low')
  };

  // Определяем названия для ячеек матрицы
  const cellTitles = {
    'high-high': 'Важно / Сложно',
    'high-medium': 'Важно / Средне',
    'high-low': 'Важно / Просто',
    'medium-high': 'Средне / Сложно',
    'medium-medium': 'Средне / Средне',
    'medium-low': 'Средне / Просто',
    'low-high': 'Минимум / Сложно',
    'low-medium': 'Минимум / Средне',
    'low-low': 'Минимум / Просто'
  };

  // Определяем CSS классы для ячеек матрицы
  const getCellClasses = (importance, complexity) => {
    return \`matrix-cell \${importance}-important \${complexity}-complexity\`;
  };

  return (
    <div className="matrix-container">
      <div className="matrix-header">
        <h2>Матрица задач по важности и сложности</h2>
      </div>

      {/* Строка "Важно" */}
      <div className="matrix-row">
        <div className={getCellClasses('high', 'high')}>
          <div className="cell-header">{cellTitles['high-high']}</div>
          {groupedTasks['high-high'].map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
        <div className={getCellClasses('high', 'medium')}>
          <div className="cell-header">{cellTitles['high-medium']}</div>
          {groupedTasks['high-medium'].map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
        <div className={getCellClasses('high', 'low')}>
          <div className="cell-header">{cellTitles['high-low']}</div>
          {groupedTasks['high-low'].map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>

      {/* Строка "Средне" */}
      <div className="matrix-row">
        <div className={getCellClasses('medium', 'high')}>
          <div className="cell-header">{cellTitles['medium-high']}</div>
          {groupedTasks['medium-high'].map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
        <div className={getCellClasses('medium', 'medium')}>
          <div className="cell-header">{cellTitles['medium-medium']}</div>
          {groupedTasks['medium-medium'].map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
        <div className={getCellClasses('medium', 'low')}>
          <div className="cell-header">{cellTitles['medium-low']}</div>
          {groupedTasks['medium-low'].map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>

      {/* Строка "Минимум" */}
      <div className="matrix-row">
        <div className={getCellClasses('low', 'high')}>
          <div className="cell-header">{cellTitles['low-high']}</div>
          {groupedTasks['low-high'].map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
        <div className={getCellClasses('low', 'medium')}>
          <div className="cell-header">{cellTitles['low-medium']}</div>
          {groupedTasks['low-medium'].map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
        <div className={getCellClasses('low', 'low')}>
          <div className="cell-header">{cellTitles['low-low']}</div>
          {groupedTasks['low-low'].map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Matrix;
