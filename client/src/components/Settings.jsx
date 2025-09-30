import React, { useState } from 'react';

const Settings = ({ config, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    baseUrl: config?.baseUrl || '',
    apiKey: config?.apiKey || '',
    boardId: config?.boardId || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="settings">
      <h2>Настройки подключения к Kaiten API</h2>
      <form className="settings-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="baseUrl">URL-адрес Kaiten:</label>
          <input
            type="text"
            id="baseUrl"
            name="baseUrl"
            value={formData.baseUrl}
            onChange={handleChange}
            placeholder="https://yourcompany.kaiten.ru"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="apiKey">API ключ:</label>
          <input
            type="password"
            id="apiKey"
            name="apiKey"
            value={formData.apiKey}
            onChange={handleChange}
            placeholder="Введите ваш API ключ"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="boardId">ID доски:</label>
          <input
            type="number"
            id="boardId"
            name="boardId"
            value={formData.boardId}
            onChange={handleChange}
            placeholder="ID доски в Kaiten"
            required
          />
        </div>
        <div className="form-group" style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} style={{ backgroundColor: '#6c757d', marginRight: '10px' }}>
            Отмена
          </button>
          <button type="submit">
            Сохранить
          </button>
        </div>
      </form>
      <div style={{ marginTop: '15px', fontSize: '14px', color: '#586069' }}>
        <p>Инструкция по получению API ключа в Kaiten:</p>
        <ol>
          <li>Перейдите в настройки профиля в Kaiten</li>
          <li>Выберите раздел "API-ключи"</li>
          <li>Создайте новый ключ с необходимыми правами доступа</li>
          <li>Скопируйте и вставьте ключ в поле выше</li>
        </ol>
      </div>
    </div>
  );
};

export default Settings;