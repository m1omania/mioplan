import React, { useState, useEffect } from 'react';
import { fetchKaitenTasks } from './api/kaitenApi';
import Matrix from './components/Matrix';
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

  // Проверяем, есть ли сохраненные настройки API
  useEffect(() => {
    const savedConfig = localStorage.getItem('kaitenApiConfig');
    if (savedConfig) {
      setApiConfig(JSON.parse(savedConfig));
    }
  }, []);

  // Загружаем задачи при изменении конфигурации API
  useEffect(() => {
    if (apiConfig.baseUrl && apiConfig.apiKey && apiConfig.boardId) {
      loadTasks();
    } else {
      // Если нет конфигурации, используем моковые данные
      setMockTasks();
    }
  }, [apiConfig]);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchKaitenTasks(apiConfig);
      setTasks(data);
    } catch (err) {
      setError(`Ошибка загрузки задач: ${err.message}`);
      // В случае ошибки используем моковые данные
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
    if (apiConfig.baseUrl && apiConfig.apiKey && apiConfig.boardId) {
      loadTasks();
    } else {
      setMockTasks();
    }
  };

  const handleSaveConfig = (config) => {
    setApiConfig(config);
    localStorage.setItem('kaitenApiConfig', JSON.stringify(config));
    setShowSettings(false);
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
      ) : (
        <Matrix tasks={tasks} />
      )}
    </div>
  );
}

export default App;
