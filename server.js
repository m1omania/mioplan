const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5176', 'https://mioplan.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Хранилище данных в памяти
const boards = new Map();

// Получить состояние доски
app.get('/api/boards/:boardId', (req, res) => {
  try {
    const { boardId } = req.params;

    if (boards.has(boardId)) {
      const tasks = boards.get(boardId);
      return res.json({
        id: boardId,
        title: `Доска ${boardId}`,
        tasks: tasks
      });
    }

    // Если доска не найдена, возвращаем 404
    res.status(404).json({ error: 'Board not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Сохранить состояние доски
app.put('/api/boards/:boardId', (req, res) => {
  try {
    const { boardId } = req.params;
    const boardData = req.body;

    // Сохраняем задачи для доски
    boards.set(boardId, boardData.tasks || []);

    res.json({
      id: boardId,
      title: boardData.title || `Доска ${boardId}`,
      tasks: boards.get(boardId)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все задачи для доски
app.get('/api/boards/:boardId/tasks', async (req, res) => {
  try {
    const { boardId } = req.params;

    // Проверяем, есть ли у нас сохраненные данные для этой доски
    if (boards.has(boardId)) {
      const tasks = boards.get(boardId);
      return res.json(tasks);
    }

    // Если нет сохраненных данных, возвращаем пустой массив
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Прокси для Kaiten API
app.get('/api/kaiten/cards', async (req, res) => {
  try {
    const { board_id, base_url, api_key } = req.query;

    if (!board_id || !api_key) {
      return res.status(400).json({ error: 'board_id and api_key are required' });
    }

    const baseUrl = base_url || 'https://api.kaiten.ru';
    // Удаляем завершающий слэш, если он есть, чтобы избежать двойного слэша
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const url = `${cleanBaseUrl}/v1/cards?board_id=${board_id}`;

    console.log(`Proxying request to: ${url}`);

    // Добавляем User-Agent и другие заголовки, которые могут требоваться
    const headers = {
      'Authorization': `Bearer ${api_key}`,
      'Content-Type': 'application/json',
      'User-Agent': 'MioPlan/1.0'
    };

    console.log(`Using headers:`, JSON.stringify(headers, null, 2));

    const response = await fetch(url, {
      headers: headers
    });

    // Получаем текст ответа для отладки
    const responseText = await response.text();
    console.log(`Response status: ${response.status} ${response.statusText}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
    console.log(`Response text (first 200 chars):`, responseText.substring(0, 200));

    if (!response.ok) {
      console.error(`Kaiten API error: ${response.status} ${response.statusText}`, responseText);
      return res.status(response.status).json({
        error: `Kaiten API error: ${response.statusText}`,
        details: responseText
      });
    }

    // Парсим JSON из полученного текста
    let cards;
    try {
      cards = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return res.status(500).json({ 
        error: 'Error parsing response from Kaiten API',
        details: parseError.message 
      });
    }

    res.json(cards);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Создать новую задачу
app.post('/api/boards/:boardId/tasks', (req, res) => {
  try {
    const { boardId } = req.params;
    const taskData = req.body;

    // Создаем доску, если она не существует
    if (!boards.has(boardId)) {
      boards.set(boardId, []);
    }

    const tasks = boards.get(boardId);

    // Генерируем ID для новой задачи
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

    const newTask = {
      id: newId,
      title: taskData.title,
      description: taskData.description,
      importance: taskData.importance,
      complexity: taskData.complexity,
      startDate: taskData.start_date,
      endDate: taskData.end_date,
      tags: taskData.tags
    };

    tasks.push(newTask);

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить задачу
app.put('/api/boards/:boardId/tasks/:taskId', (req, res) => {
  try {
    const { boardId, taskId } = req.params;
    const taskData = req.body;

    // Если доска не существует, возвращаем ошибку
    if (!boards.has(boardId)) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const tasks = boards.get(boardId);
    const taskIndex = tasks.findIndex(t => t.id == taskId);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Обновляем задачу
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      title: taskData.title,
      description: taskData.description,
      importance: taskData.importance,
      complexity: taskData.complexity,
      startDate: taskData.start_date,
      endDate: taskData.end_date,
      tags: taskData.tags
    };

    res.json(tasks[taskIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить задачу
app.delete('/api/boards/:boardId/tasks/:taskId', (req, res) => {
  try {
    const { boardId, taskId } = req.params;

    // Если доска не существует, возвращаем ошибку
    if (!boards.has(boardId)) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const tasks = boards.get(boardId);
    const taskIndex = tasks.findIndex(t => t.id == taskId);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    tasks.splice(taskIndex, 1);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Сброс состояния доски
app.post('/api/boards/:boardId/reset', (req, res) => {
  try {
    const { boardId } = req.params;

    // Создаем дефолтные задачи
    const defaultTasks = [
      {
        id: 1,
        title: 'Разработать новый дизайн',
        description: 'Создать современный и удобный интерфейс для главной страницы',
        importance: 'high',
        complexity: 'high',
        startDate: null,
        endDate: null,
        tags: ['дизайн', 'UI/UX']
      },
      {
        id: 2,
        title: 'Исправить баги в профиле',
        description: 'Проблемы с отображением аватара и сохранением настроек',
        importance: 'medium',
        complexity: 'low',
        startDate: null,
        endDate: null,
        tags: ['баг', 'профиль']
      },
      {
        id: 3,
        title: 'Оптимизировать запросы к БД',
        description: 'Ускорить загрузку страниц за счет оптимизации SQL-запросов',
        importance: 'high',
        complexity: 'medium',
        startDate: null,
        endDate: null,
        tags: ['база данных', 'оптимизация']
      },
      {
        id: 4,
        title: 'Написать документацию',
        description: 'Подготовить техническую документацию для нового модуля',
        importance: 'low',
        complexity: 'low',
        startDate: null,
        endDate: null,
        tags: ['документация']
      },
      {
        id: 5,
        title: 'Интеграция с платежной системой',
        description: 'Подключить и настроить прием платежей через Stripe',
        importance: 'high',
        complexity: 'high',
        startDate: null,
        endDate: null,
        tags: ['интеграция', 'платежи']
      }
    ];

    // Сохраняем задачи в доске
    boards.set(boardId, defaultTasks);

    res.json(defaultTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
