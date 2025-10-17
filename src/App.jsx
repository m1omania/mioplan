import React, { useState, useEffect } from 'react';
import UnsortedColumn from './components/UnsortedColumn';
import TaskMatrix from './components/TaskMatrix';
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
      
      // Сначала пытаемся загрузить из Kaiten API с данными по умолчанию
      const kaitenParams = new URLSearchParams({
        base_url: 'https://solargroup.kaiten.ru',
        api_key: 'b1363503-1a24-4f26-8400-8256673eb965',
        board_id: '1514460'
      });
      
      const kaitenResponse = await fetch(`/api/kaiten/cards?${kaitenParams}`);
      
      if (kaitenResponse.ok) {
        const kaitenTasks = await kaitenResponse.json();
        console.log('Loaded tasks from Kaiten:', kaitenTasks.length);
        setTasks(kaitenTasks);
      } else {
        // Если Kaiten недоступен, загружаем локально сохраненные задачи
        const response = await fetch('/api/tasks');
        if (!response.ok) {
          throw new Error('Failed to load tasks');
        }
        
        const data = await response.json();
        setTasks(data);
      }
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

      // Обновляем только локальное состояние (данные из Kaiten не сохраняем)
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

  // Функция для сброса всех задач в "Неразобранное"
  const resetAllTasksToUnsorted = async () => {
    try {
      console.log('App: Resetting all tasks to unsorted');
      
      // Обновляем все задачи локально
      const updatedTasks = tasks.map(task => ({
        ...task,
        importance: null,
        complexity: null,
        startDate: null,
        endDate: null
      }));

      setTasks(updatedTasks);

      // Обновляем задачи на сервере
      const updatePromises = updatedTasks.map(task => 
        fetch(`/api/tasks/${task.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(task),
        })
      );

      await Promise.all(updatePromises);
      console.log('App: All tasks reset to unsorted');
    } catch (err) {
      console.error('Error resetting tasks:', err);
      setError(err.message);
    }
  };


  if (loading) {
    return (
      <div className="app">
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

          console.log('App: Rendering with tasks:', tasks.length);
          console.log('App: Sample task:', tasks[0]);

          return (
            <div className="app">
              <div className="app-header">
                <button 
                  onClick={resetAllTasksToUnsorted}
                  className="reset-button"
                  title="Переместить все задачи в Неразобранное"
                >
                  Сбросить все задачи
                </button>
              </div>
              <UnsortedColumn 
                tasks={tasks} 
                onTaskUpdate={handleTaskUpdate}
              />
              <TaskMatrix 
                tasks={tasks} 
                onTaskUpdate={handleTaskUpdate}
              />
            </div>
          );
}

export default App;