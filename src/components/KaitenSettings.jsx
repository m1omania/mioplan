import React, { useState } from 'react';
import './KaitenSettings.css';

function KaitenSettings({ onConnect, onClose }) {
  const [settings, setSettings] = useState({
    baseUrl: 'https://ux.kaiten.ru',
    apiKey: '',
    boardId: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Загружаем задачи из Kaiten API
      const params = new URLSearchParams({
        base_url: settings.baseUrl,
        api_key: settings.apiKey,
        board_id: settings.boardId
      });
      
      const response = await fetch(`/api/kaiten/cards?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to connect to Kaiten');
      }
      
      const tasks = await response.json();
      console.log('Loaded tasks from Kaiten:', tasks);
      
      // Сохраняем задачи локально
      for (const task of tasks) {
        await fetch(`/api/tasks/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task)
        });
      }
      
      onConnect(tasks);
      onClose();
    } catch (error) {
      console.error('Error connecting to Kaiten:', error);
      alert(`Ошибка подключения к Kaiten: ${error.message}`);
    }
  };

  return (
    <div className="kaiten-settings-overlay">
      <div className="kaiten-settings-modal">
        <h2>Настройки Kaiten</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="baseUrl">Base URL:</label>
            <input
              type="url"
              id="baseUrl"
              value={settings.baseUrl}
              onChange={(e) => setSettings({...settings, baseUrl: e.target.value})}
              placeholder="https://ux.kaiten.ru"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="apiKey">API Key:</label>
            <input
              type="password"
              id="apiKey"
              value={settings.apiKey}
              onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
              placeholder="Ваш API ключ"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="boardId">Board ID:</label>
            <input
              type="text"
              id="boardId"
              value={settings.boardId}
              onChange={(e) => setSettings({...settings, boardId: e.target.value})}
              placeholder="ID доски"
              required
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose}>Отмена</button>
            <button type="submit">Подключиться</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default KaitenSettings;
