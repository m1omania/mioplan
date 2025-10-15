import React, { useState, useEffect } from 'react';
import Timeline from './components/Timeline';
import Header from './components/Header';
import UndefinedTasks from './components/UndefinedTasks';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка задач при старте
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Загружаем задачи из Kaiten через наш API
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to load tasks');
      }
      
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (updatedTask) => {
    try {
      console.log('App: Updating task:', {
        id: updatedTask.id,
        title: updatedTask.title,
        startDate: updatedTask.startDate,
        endDate: updatedTask.endDate,
        importance: updatedTask.importance,
        complexity: updatedTask.complexity
      });

      // Обновляем задачу на сервере
      const response = await fetch(`/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Обновляем локальное состояние
      setTasks(prevTasks => {
        const newTasks = prevTasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        );
        console.log('App: Tasks updated, new count:', newTasks.length);
        return newTasks;
      });
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <Header tasks={tasks} />
        <div className="loading">
          <div className="spinner"></div>
          <p>Загружаем задачи...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Header tasks={tasks} />
        <div className="error">
          <h2>Ошибка загрузки</h2>
          <p>{error}</p>
          <button onClick={loadTasks} className="retry-btn">
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

          return (
            <div className="app">
              <Header tasks={tasks} />
              <main className="main">
                <div className="main-content">
                  <UndefinedTasks 
                    tasks={tasks} 
                    onTaskUpdate={handleTaskUpdate}
                  />
                  <Timeline 
                    tasks={tasks} 
                    onTaskUpdate={handleTaskUpdate}
                  />
                </div>
              </main>
            </div>
          );
}

export default App;