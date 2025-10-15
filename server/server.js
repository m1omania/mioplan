const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://mioplan-timeline.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Конфигурация Kaiten API
const KAITEN_CONFIG = {
  baseUrl: 'https://solargroup.kaiten.ru',
  apiKey: 'b1363503-1a24-4f26-8400-8256673eb965',
  boardId: '1514460'
};

// Файловое хранилище
const DATA_FILE = path.join(__dirname, 'tasks.json');

// Загружаем сохраненные задачи
let savedTasks = new Map();
try {
  if (fs.existsSync(DATA_FILE)) {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    savedTasks = new Map(Object.entries(data));
    console.log('Загружены сохраненные задачи:', savedTasks.size);
  }
} catch (error) {
  console.error('Ошибка загрузки данных:', error);
}

// Сохраняем данные
const saveData = () => {
  try {
    const data = Object.fromEntries(savedTasks);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Ошибка сохранения данных:', error);
  }
};

// Загружаем задачи из Kaiten
const fetchKaitenTasks = async () => {
  try {
    const response = await axios.get(`${KAITEN_CONFIG.baseUrl}/api/v1/cards`, {
      params: {
        board_id: KAITEN_CONFIG.boardId,
        limit: 100
      },
      headers: {
        'Authorization': `Bearer ${KAITEN_CONFIG.apiKey}`
      }
    });

    return response.data.map(card => ({
      id: card.id,
      title: card.title,
      description: card.description || 'Нет описания',
      importance: null, // По умолчанию неопределено - попадет в область слева
      complexity: null, // По умолчанию неопределено - попадет в область слева
      startDate: null,
      endDate: null,
      tags: card.tags ? card.tags.map(tag => tag.title) : []
    }));
  } catch (error) {
    console.error('Ошибка загрузки из Kaiten:', error);
    return [];
  }
};

// Объединяем задачи из Kaiten с сохраненными
const mergeTasks = (kaitenTasks) => {
  const savedTasksMap = new Map();
  savedTasks.forEach((task, id) => {
    savedTasksMap.set(parseInt(id), task);
  });

  return kaitenTasks.map(kaitenTask => {
    const savedTask = savedTasksMap.get(kaitenTask.id);
    if (savedTask) {
      return {
        ...kaitenTask,
        importance: savedTask.importance,
        complexity: savedTask.complexity,
        startDate: savedTask.startDate || kaitenTask.startDate,
        endDate: savedTask.endDate || kaitenTask.endDate
      };
    }
    return kaitenTask;
  });
};

// API Routes

// Получить все задачи
app.get('/api/tasks', async (req, res) => {
  try {
    const kaitenTasks = await fetchKaitenTasks();
    const mergedTasks = mergeTasks(kaitenTasks);
    res.json(mergedTasks);
  } catch (error) {
    console.error('Ошибка получения задач:', error);
    res.status(500).json({ error: 'Ошибка загрузки задач' });
  }
});

// Обновить задачу
app.put('/api/tasks/:id', (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const taskData = req.body;
    
    savedTasks.set(taskId, {
      importance: taskData.importance,
      complexity: taskData.complexity,
      startDate: taskData.startDate,
      endDate: taskData.endDate
    });
    
    saveData();
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления задачи:', error);
    res.status(500).json({ error: 'Ошибка обновления задачи' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📊 Kaiten API: ${KAITEN_CONFIG.baseUrl}`);
  console.log(`📋 Board ID: ${KAITEN_CONFIG.boardId}`);
});
