import React from 'react';
import MatrixCell from './MatrixCell';

const Matrix = ({ tasks, onTaskMove }) => {
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
    return "matrix-cell " + importance + "-important " + complexity + "-complexity";
  };


  return (
    <div className="matrix-container">

      {/* Строка "Важно" */}
      <div className="matrix-row">
        <MatrixCell 
          importance="high" 
          complexity="high" 
          title={cellTitles['high-high']}
          tasks={groupedTasks['high-high']}
          onTaskMove={onTaskMove}
          cellClass={getCellClasses('high', 'high')}
        />
        <MatrixCell 
          importance="high" 
          complexity="medium" 
          title={cellTitles['high-medium']}
          tasks={groupedTasks['high-medium']}
          onTaskMove={onTaskMove}
          cellClass={getCellClasses('high', 'medium')}
        />
        <MatrixCell 
          importance="high" 
          complexity="low" 
          title={cellTitles['high-low']}
          tasks={groupedTasks['high-low']}
          onTaskMove={onTaskMove}
          cellClass={getCellClasses('high', 'low')}
        />
      </div>

      {/* Строка "Средне" */}
      <div className="matrix-row">
        <MatrixCell 
          importance="medium" 
          complexity="high" 
          title={cellTitles['medium-high']}
          tasks={groupedTasks['medium-high']}
          onTaskMove={onTaskMove}
          cellClass={getCellClasses('medium', 'high')}
        />
        <MatrixCell 
          importance="medium" 
          complexity="medium" 
          title={cellTitles['medium-medium']}
          tasks={groupedTasks['medium-medium']}
          onTaskMove={onTaskMove}
          cellClass={getCellClasses('medium', 'medium')}
        />
        <MatrixCell 
          importance="medium" 
          complexity="low" 
          title={cellTitles['medium-low']}
          tasks={groupedTasks['medium-low']}
          onTaskMove={onTaskMove}
          cellClass={getCellClasses('medium', 'low')}
        />
      </div>

      {/* Строка "Минимум" */}
      <div className="matrix-row">
        <MatrixCell 
          importance="low" 
          complexity="high" 
          title={cellTitles['low-high']}
          tasks={groupedTasks['low-high']}
          onTaskMove={onTaskMove}
          cellClass={getCellClasses('low', 'high')}
        />
        <MatrixCell 
          importance="low" 
          complexity="medium" 
          title={cellTitles['low-medium']}
          tasks={groupedTasks['low-medium']}
          onTaskMove={onTaskMove}
          cellClass={getCellClasses('low', 'medium')}
        />
        <MatrixCell 
          importance="low" 
          complexity="low" 
          title={cellTitles['low-low']}
          tasks={groupedTasks['low-low']}
          onTaskMove={onTaskMove}
          cellClass={getCellClasses('low', 'low')}
        />
      </div>
    </div>
  );
};

export default Matrix;
