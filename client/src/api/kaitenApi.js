import axios from 'axios';

// Функция для получения задач из Kaiten API
export const fetchKaitenTasks = async (config) => {
  const { baseUrl, apiKey, boardId } = config;

  console.log('Попытка подключения к Kaiten API:', { baseUrl, boardId });

  try {
    // Создаем экземпляр axios с базовыми настройками
    // Используем относительный URL для использования прокси
    const api = axios.create({
      baseURL: '', // Пустой baseURL, так как запросы будут идти через прокси
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

    // Получаем все карточки с доски
    console.log('Отправка запроса к API...');
    // Пробуем альтернативный эндпоинт
    let response;
    try {
      // Используем новый префикс /kaiten-api для прокси
      response = await api.get('/kaiten-api/api/latest/cards?board_id=' + boardId);
    } catch (firstError) {
      console.log('Первый запрос не удался, пробуем альтернативный эндпоинт:', firstError.message);
      try {
        // Пробуем другой формат эндпоинта
        response = await api.get('/kaiten-api/api/cards?board_id=' + boardId);
      } catch (secondError) {
        console.log('Второй запрос также не удался:', secondError.message);
        // Пробуем еще один вариант
        response = await api.get('/kaiten-api/boards/' + boardId + '/cards');
      }
    }
    console.log('Ответ от API получен:', response.data);

    // Проверяем, что ответ содержит массив карточек
    if (!Array.isArray(response.data)) {
      console.error('Ответ от API не является массивом:', response.data);
      throw new Error('Некорректный формат ответа от API');
    }

    // Преобразуем данные в нужный формат
    const tasks = await Promise.all(response.data.map(async card => {
      console.log('Обработка карточки:', card);
      console.log('Все поля карточки:', Object.keys(card));
      console.log('Значение description_filled:', card.description_filled);
      
      // Получаем описание карточки через отдельный запрос, если description_filled = true
      let description = 'Нет описания';
      if (card.description_filled) {
        try {
          console.log('Получаем описание для карточки:', card.id);
          const cardDetailsResponse = await api.get(`/kaiten-api/api/latest/cards/${card.id}`);
          console.log('Детали карточки:', cardDetailsResponse.data);
          
          // Проверяем различные поля для описания
          if (cardDetailsResponse.data.description) {
            description = cardDetailsResponse.data.description;
          } else if (cardDetailsResponse.data.body) {
            description = cardDetailsResponse.data.body;
          } else if (cardDetailsResponse.data.content) {
            description = cardDetailsResponse.data.content;
          } else if (cardDetailsResponse.data.text) {
            description = cardDetailsResponse.data.text;
          }
          
          console.log('Полученное описание:', description);
        } catch (descError) {
          console.error('Ошибка при получении описания карточки:', descError);
        }
      }

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
        description: description,
        importance,
        complexity,
        tags
      };
    }));

    console.log('Задачи успешно обработаны:', tasks);
    return tasks;
  } catch (error) {
    console.error('Ошибка при получении задач из Kaiten API:', error);
    if (error.response) {
      console.error('Статус ошибки:', error.response.status);
      console.error('Данные ошибки:', error.response.data);
    }
    throw new Error(error.response?.data?.message || error.message || 'Не удалось загрузить задачи');
  }
};