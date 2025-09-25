import axios from 'axios';

// Функция для получения задач из Kaiten API
export const fetchKaitenTasks = async (config) => {
  const { baseUrl, apiKey, boardId } = config;

  try {
    // Создаем экземпляр axios с базовыми настройками
    const api = axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': \`Bearer \${apiKey}\`,
        'Content-Type': 'application/json'
      }
    });

    // Получаем все карточки с доски
    const response = await api.get(\`/api/latest/cards?board_id=\${boardId}\`);

    // Преобразуем данные в нужный формат
    const tasks = response.data.map(card => {
      // Определяем важность на основе свойств карточки
      let importance = 'medium';
      if (card.priority === 1 || card.priority === 'high') {
        importance = 'high';
      } else if (card.priority === 3 || card.priority === 'low') {
        importance = 'low';
      }

      // Определяем сложность на основе свойств карточки
      let complexity = 'medium';
      if (card.difficulty === 'hard' || card.difficulty === 3) {
        complexity = 'high';
      } else if (card.difficulty === 'easy' || card.difficulty === 1) {
        complexity = 'low';
      }

      // Получаем теги из карточки
      const tags = card.tags ? card.tags.map(tag => tag.name) : [];

      return {
        id: card.id,
        title: card.title,
        description: card.description || 'Нет описания',
        importance,
        complexity,
        tags
      };
    });

    return tasks;
  } catch (error) {
    console.error('Ошибка при получении задач из Kaiten API:', error);
    throw new Error(error.response?.data?.message || 'Не удалось загрузить задачи');
  }
};
