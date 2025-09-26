import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { fetchKaitenTasks } from './api/kaitenApi';
import Matrix from './components/Matrix';
import TimelineView from './components/Timeline';
import ViewToggle from './components/ViewToggle';
import Settings from './components/Settings';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiConfig, setApiConfig] = useState({
    baseUrl: '',
    apiKey: '',
    boardId: ''
  });
  const [showSettings, setShowSettings] = useState(false);
  const [view, setView] = useState('matrix'); // 'matrix' или 'timeline'

  // Проверяем, есть ли сохраненные настройки API
  useEffect(() => {
    const savedConfig = localStorage.getItem('kaitenApiConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        console.log('Загружены сохраненные настройки API:', parsedConfig);
        setApiConfig(parsedConfig);
      } catch (e) {
        console.error('Ошибка при разборе сохраненных настроек:', e);
        localStorage.removeItem('kaitenApiConfig');
      }
    } else {
      console.log('Сохраненные настройки API не найдены');
    }
  }, []);

  // Загружаем задачи при изменении конфигурации API
  useEffect(() => {
    console.log('Проверка конфигурации API:', apiConfig);
    if (apiConfig.baseUrl && apiConfig.apiKey && apiConfig.boardId) {
      console.log('Конфигурация API заполнена, загружаем задачи');
      loadTasks();
    } else {
      console.log('Конфигурация API не заполнена, используем моковые данные');
      // Если нет конфигурации, используем моковые данные
      setMockTasks();
    }
  }, [apiConfig]);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Начинаем загрузку задач с конфигурацией:', apiConfig);
      const data = await fetchKaitenTasks(apiConfig);
      console.log('Задачи успешно загружены:', data);
      // Если API вернул пустой массив, используем моковые данные
      if (Array.isArray(data) && data.length === 0) {
        console.log('API вернул пустой массив задач, используем моковые данные');
        setMockTasks();
      } else {
        setTasks(data);
      }
    } catch (err) {
      console.error('Ошибка при загрузке задач:', err);
      setError('Ошибка загрузки задач: ' + err.message);
      // В случае ошибки используем моковые данные
      console.log('Используем моковые данные из-за ошибки');
      setMockTasks();
    } finally {
      setLoading(false);
    }
  };

  const setMockTasks = () => {
    // Моковые задачи для демонстрации
    const mockTasks = [
      {
        id: 1,
        title: 'Разработать новый дизайн',
        description: 'Создать современный и удобный интерфейс для главной страницы',
        importance: 'high',
        complexity: 'high',
        tags: ['дизайн', 'UI/UX']
      },
      {
        id: 2,
        title: 'Исправить баги в профиле',
        description: 'Проблемы с отображением аватара и сохранением настроек',
        importance: 'medium',
        complexity: 'low',
        tags: ['баг', 'профиль']
      },
      {
        id: 3,
        title: 'Оптимизировать запросы к БД',
        description: 'Ускорить загрузку страниц за счет оптимизации SQL-запросов',
        importance: 'high',
        complexity: 'medium',
        tags: ['база данных', 'оптимизация']
      },
      {
        id: 4,
        title: 'Написать документацию',
        description: 'Подготовить техническую документацию для нового модуля',
        importance: 'low',
        complexity: 'low',
        tags: ['документация']
      },
      {
        id: 5,
        title: 'Интеграция с платежной системой',
        description: 'Подключить и настроить прием платежей через Stripe',
        importance: 'high',
        complexity: 'high',
        tags: ['интеграция', 'платежи']
      },
      {
        id: 6,
        title: 'Обновить зависимости',
        description: 'Проверить и обновить устаревшие пакеты в package.json',
        importance: 'medium',
        complexity: 'low',
        tags: ['поддержка']
      },
      {
        id: 7,
        title: 'Добавить темную тему',
        description: 'Реализовать переключение между светлой и темной темой',
        importance: 'medium',
        complexity: 'medium',
        tags: ['UI', 'фича']
      },
      {
        id: 8,
        title: 'Настроить CI/CD',
        description: 'Автоматизировать развертывание приложения на сервере',
        importance: 'medium',
        complexity: 'high',
        tags: ['DevOps', 'автоматизация']
      },
      {
        id: 9,
        title: 'Рефакторинг кода',
        description: 'Улучшить структуру и читаемость кода в модуле авторизации',
        importance: 'low',
        complexity: 'medium',
        tags: ['рефакторинг']
      }
    ];

    setTasks(mockTasks);
    setLoading(false);
  };

  const handleRefresh = () => {
    console.log('Обновление задач, конфигурация API:', apiConfig);
    if (apiConfig.baseUrl && apiConfig.apiKey && apiConfig.boardId) {
      console.log('Загружаем задачи с API');
      loadTasks();
    } else {
      console.log('Конфигурация API не заполнена, обновляем моковые данные');
      setMockTasks();
    }
  };

  const handleSaveConfig = (config) => {
    console.log('Сохранение настроек API:', config);
    setApiConfig(config);
    try {
      localStorage.setItem('kaitenApiConfig', JSON.stringify(config));
      console.log('Настройки успешно сохранены в localStorage');
    } catch (e) {
      console.error('Ошибка при сохранении настроек в localStorage:', e);
    }
    setShowSettings(false);
  };

  const handleTaskMove = (taskId, newImportance, newComplexity) => {
    console.log(`Перемещение задачи ${taskId} в категорию важности: ${newImportance}, сложности: ${newComplexity}`);

    // Обновляем задачу в массиве задач
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, importance: newImportance, complexity: newComplexity }
          : task
      )
    );
  };

  // Обработчик обновления задачи (для таймлайна)
  const handleTaskUpdate = (updatedTask) => {
    console.log('Обновление задачи:', updatedTask);

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === updatedTask.id
          ? {
              ...task,
              timelineStart: updatedTask.start,
              timelineEnd: updatedTask.end,
              timelineGroup: updatedTask.group
            }
          : task
      )
    );
  };

  // Обработчик удаления задачи (для таймлайна)
  const handleTaskDelete = (taskId) => {
    console.log('Удаление задачи:', taskId);

    // Удаляем задачу из массива задач
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  return (
    <div className="container">
      <header>
        <h1>Матрица задач Kaiten</h1>
        <div>
          <button
            className="refresh-button"
            onClick={() => setShowSettings(!showSettings)}
          >
            Настройки API
          </button>
          <button
            className="refresh-button"
            onClick={handleRefresh}
            style={{ marginLeft: '10px' }}
          >
            Обновить
          </button>
        </div>
      </header>

      <ViewToggle activeView={view} onViewChange={setView} />

      {showSettings && (
        <Settings
          initialConfig={apiConfig}
          onSave={handleSaveConfig}
          onCancel={() => setShowSettings(false)}
        />
      )}

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading">Загрузка задач...</div>
      ) : view === 'matrix' ? (
        <DndProvider backend={HTML5Backend}>
          <Matrix tasks={tasks} onTaskMove={handleTaskMove} />
        </DndProvider>
      ) : (
        <TimelineView 
          tasks={tasks} 
          onTaskUpdate={handleTaskUpdate} 
          onTaskDelete={handleTaskDelete} 
        />
      )}
    </div>
  );
}

export default App;
