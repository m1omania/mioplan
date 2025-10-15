import React from 'react';

const UndefinedTasks = ({ tasks = [] }) => {
  // Фильтруем задачи без определенного типа
  const undefinedTasks = tasks.filter(task => 
    !task.importance || !task.complexity || 
    task.importance === 'undefined' || task.complexity === 'undefined' ||
    task.importance === null || task.complexity === null
  );

  return (
    <div style={{
      width: '280px',
      background: 'white',
      border: '1px solid #ccc',
      marginRight: '20px',
      padding: '10px'
    }}>
      <h3 style={{margin: '0 0 10px 0'}}>Неопределенные задачи ({undefinedTasks.length})</h3>
      
      {undefinedTasks.length === 0 ? (
        <p>Все задачи классифицированы!</p>
      ) : (
        <div style={{maxHeight: '400px', overflowY: 'auto'}}>
          {undefinedTasks.slice(0, 10).map(task => (
            <div
              key={task.id}
              style={{
                background: '#f5f5f5',
                border: '1px solid #ddd',
                padding: '8px',
                marginBottom: '5px',
                cursor: 'pointer'
              }}
              title={task.description || task.title}
            >
              {task.title}
            </div>
          ))}
          {undefinedTasks.length > 10 && (
            <div style={{textAlign: 'center', fontSize: '12px', color: '#666'}}>
              ... и еще {undefinedTasks.length - 10} задач
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UndefinedTasks;
