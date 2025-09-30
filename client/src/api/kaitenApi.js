import axios from 'axios';

// Функция для получения задач из Kaiten API
export const fetchKaitenTasks = async (config) => {
  const { baseUrl, apiKey, boardId } = config;
  console.log('fetchKaitenTasks called with config:', { baseUrl, apiKey: '***', boardId });

  try {
    // Создаем экземпляр axios с базовыми настройками
    const api = axios.create({
      baseURL: '/api', // Используем /api для обращения к нашему серверу
      headers: {
        // Используем стандартный формат авторизации Bearer
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        // Добавляем дополнительные заголовки, которые могут требоваться
        'Accept': 'application/json'
      },
      // Добавляем параметры для CORS
      withCredentials: false,
      // Добавляем таймаут для предотвращения зависания
      timeout: 15000
    });

    // Получаем все карточки с доски через наш сервер
    console.log('Sending request to our server API...');
    const response = await api.get(`/kaiten/cards?board_id=${boardId}&base_url=${encodeURIComponent(baseUrl || 'https://api.kaiten.ru')}&api_key=${encodeURIComponent(apiKey)}`);
    
    console.log('Received response from our server:', response.status, response.statusText);
    console.log('Response data type:', typeof response.data);
    console.log('Response data keys:', Object.keys(response.data));

    // Проверяем, что ответ содержит массив карточек
    if (!Array.isArray(response.data)) {
      console.error('Response data is not an array:', response.data);
      throw new Error('Некорректный формат ответа от API');
    }

    // Преобразуем данные в нужный формат
    console.log(`Processing ${response.data.length} cards...`);
    const tasks = response.data.map(card => {
      console.log('Processing card:', card.id, card.title);
      
      // Определяем важность на основе свойств карточки
      let importance = 'medium';
      if (card.priority === 1 || card.priority === 'high' || card.priority === 'critical') {
        importance = 'high';
      } else if (card.priority === 3 || card.priority === 'low' || card.priority === 'minor') {
        importance = 'low';
      }

      // Определяем сложность на основе свойств карточки
      let complexity = 'medium';
      if (card.difficulty === 'hard' || card.difficulty === 3 || card.difficulty === 'high') {
        complexity = 'high';
      } else if (card.difficulty === 'easy' || card.difficulty === 1 || card.difficulty === 'low') {
        complexity = 'low';
      }

      // Альтернативный способ определения сложности через теги
      if (complexity === 'medium' && card.tags) {
        const tagNames = card.tags.map(tag => tag.name.toLowerCase());
        if (tagNames.includes('сложно') || tagNames.includes('hard') || tagNames.includes('high')) {
          complexity = 'high';
        } else if (tagNames.includes('просто') || tagNames.includes('easy') || tagNames.includes('low')) {
          complexity = 'low';
        }
      }

      // Альтернативный способ определения важности через теги
      if (importance === 'medium' && card.tags) {
        const tagNames = card.tags.map(tag => tag.name.toLowerCase());
        if (tagNames.includes('важно') || tagNames.includes('important') || tagNames.includes('high') || tagNames.includes('critical')) {
          importance = 'high';
        } else if (tagNames.includes('низкий') || tagNames.includes('minor') || tagNames.includes('low')) {
          importance = 'low';
        }
      }

      // Получаем теги из карточки
      const tags = card.tags ? card.tags.map(tag => tag.name) : [];

      return {
        id: card.id,
        title: card.title || 'Без названия',
        description: card.description || 'Нет описания',
        importance,
        complexity,
        tags
      };
    });

    console.log('Successfully processed tasks:', tasks.length);
    return tasks;
  } catch (error) {
    console.error('Error in fetchKaitenTasks:', error);
    if (error.response) {
      console.error('Response error details - status:', error.response.status);
      console.error('Response error details - data:', error.response.data);
    }
    
    // Формируем более информативное сообщение об ошибке
    let errorMessage = 'Не удалось загрузить задачи';
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = 'Неверный API ключ';
      } else if (error.response.status === 404) {
        errorMessage = 'Доска не найдена';
      } else if (error.response.status === 500) {
        errorMessage = 'Ошибка сервера при подключении к Kaiten';
      } else {
        errorMessage = `Ошибка: ${error.response.status} - ${error.response.statusText}`;
      }
    } else if (error.request) {
      errorMessage = 'Нет ответа от сервера. Проверьте подключение к интернету.';
    } else {
      errorMessage = error.message || 'Неизвестная ошибка';
    }
    
    throw new Error(errorMessage);
  }
};