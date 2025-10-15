import React, { useState, useEffect } from 'react';
import Timeline from './components/Timeline';
import Header from './components/Header';
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
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        )
      );
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <Header />
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
        <Header />
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
      <Header />
      <main className="main">
        <Timeline 
          tasks={tasks} 
          onTaskUpdate={handleTaskUpdate}
        />
      </main>
    </div>
  );
}

export default App;