import React, { useState } from 'react';

const BulkTaskSelector = ({ tasks, onBulkMove }) => {
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const toggleTaskSelection = (taskId) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  const selectAllTasks = () => {
    const allTaskIds = tasks.map(task => task.id);
    setSelectedTasks(allTaskIds);
  };

  const clearSelection = () => {
    setSelectedTasks([]);
  };

  const moveSelectedTasks = (importance, complexity) => {
    if (selectedTasks.length > 0) {
      onBulkMove(selectedTasks, importance, complexity);
      clearSelection();
    }
  };

  if (!isSelecting) {
    return (
      <button 
        className="bulk-select-button"
        onClick={() => setIsSelecting(true)}
      >
        Массовое выделение
      </button>
    );
  }

  return (
    <div className="bulk-selector">
      <div className="bulk-selector-header">
        <span>Выбрано: {selectedTasks.length}</span>
        <div className="bulk-selector-actions">
          <button onClick={selectAllTasks}>Выделить все</button>
          <button onClick={clearSelection}>Очистить</button>
          <button onClick={() => setIsSelecting(false)}>Закрыть</button>
        </div>
      </div>
      
      <div className="bulk-move-controls">
        <h4>Переместить выделенные задачи в:</h4>
        <div className="sector-grid">
          {['high', 'medium', 'low'].map(importance => (
            <div key={importance} className="importance-row">
              {['high', 'medium', 'low'].map(complexity => (
                <button
                  key={`${importance}-${complexity}`}
                  className={`sector-button sector-${importance}-${complexity}`}
                  onClick={() => moveSelectedTasks(importance, complexity)}
                  disabled={selectedTasks.length === 0}
                >
                  {importance === 'high' ? 'Важно' : importance === 'medium' ? 'Средне' : 'Минимум'} / 
                  {complexity === 'high' ? 'Сложно' : complexity === 'medium' ? 'Средне' : 'Просто'}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BulkTaskSelector;