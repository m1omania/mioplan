const express = require('express');
const router = express.Router();
const { Board, Task } = require('../models');

// Получить все задачи для доски
router.get('/:boardId/tasks', async (req, res) => {
  try {
    const { boardId } = req.params;
    
    // Проверяем существование доски
    let board = await Board.findByPk(boardId);
    if (!board) {
      board = await Board.create({ id: boardId });
    }
    
    const tasks = await Task.findAll({
      where: { boardId }
    });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать новую задачу
router.post('/:boardId/tasks', async (req, res) => {
  try {
    const { boardId } = req.params;
    const taskData = req.body;
    
    // Проверяем существование доски
    let board = await Board.findByPk(boardId);
    if (!board) {
      board = await Board.create({ id: boardId });
    }
    
    const task = await Task.create({
      ...taskData,
      boardId
    });
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить задачу
router.put('/:boardId/tasks/:taskId', async (req, res) => {
  try {
    const { boardId, taskId } = req.params;
    const taskData = req.body;
    
    const task = await Task.findOne({
      where: { id: taskId, boardId }
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    await task.update(taskData);
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить задачу
router.delete('/:boardId/tasks/:taskId', async (req, res) => {
  try {
    const { boardId, taskId } = req.params;
    
    const task = await Task.findOne({
      where: { id: taskId, boardId }
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    await task.destroy();
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Сброс состояния доски
router.post('/:boardId/reset', async (req, res) => {
  try {
    const { boardId } = req.params;
    
    // Удаляем все задачи для доски
    await Task.destroy({
      where: { boardId }
    });
    
    // Создаем дефолтные задачи
    const defaultTasks = [
      {
        title: 'Разработать новый дизайн',
        description: 'Создать современный и удобный интерфейс для главной страницы',
        importance: 'high',
        complexity: 'high',
        tags: ['дизайн', 'UI/UX']
      },
      {
        title: 'Исправить баги в профиле',
        description: 'Проблемы с отображением аватара и сохранением настроек',
        importance: 'medium',
        complexity: 'low',
        tags: ['баг', 'профиль']
      },
      {
        title: 'Оптимизировать запросы к БД',
        description: 'Ускорить загрузку страниц за счет оптимизации SQL-запросов',
        importance: 'high',
        complexity: 'medium',
        tags: ['база данных', 'оптимизация']
      },
      {
        title: 'Написать документацию',
        description: 'Подготовить техническую документацию для нового модуля',
        importance: 'low',
        complexity: 'low',
        tags: ['документация']
      },
      {
        title: 'Интеграция с платежной системой',
        description: 'Подключить и настроить прием платежей через Stripe',
        importance: 'high',
        complexity: 'high',
        tags: ['интеграция', 'платежи']
      }
    ];
    
    const tasks = await Promise.all(
      defaultTasks.map(task => 
        Task.create({
          ...task,
          boardId
        })
      )
    );
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Синхронизация состояния доски
router.post('/:boardId/sync', async (req, res) => {
  try {
    const { boardId } = req.params;
    const { tasks } = req.body;
    
    // Удаляем все текущие задачи
    await Task.destroy({
      where: { boardId }
    });
    
    // Создаем новые задачи
    const newTasks = await Promise.all(
      tasks.map(task => 
        Task.create({
          ...task,
          boardId
        })
      )
    );
    
    res.json(newTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;