import React, { useMemo, useRef, useState } from 'react';
import './TaskMatrix.css';

const TaskMatrix = ({ tasks, onTaskUpdate }) => {
  const [timeScale, setTimeScale] = useState('days');
  const [hoverZone, setHoverZone] = useState(null); // { typeId, periodKey, date, x, width } // 'days', 'weeks', 'months'
  const [focusedDate, setFocusedDate] = useState(new Date()); // Центральная дата для сохранения фокуса
  const pxPerDay = 80; // базовый масштаб
  const pxPerWeek = 120; // масштаб для недель
  const pxPerMonth = 200; // масштаб для месяцев
  const trackRef = useRef(null);
  const currentDragTask = useRef(null); // Храним текущую перетаскиваемую задачу

  // Получаем текущий масштаб
  const getPxPerUnit = () => {
    if (timeScale === 'weeks') return pxPerWeek;
    if (timeScale === 'months') return pxPerMonth;
    return pxPerDay;
  };

  // Функция для обновления фокуса при скролле
  const updateFocusedDate = () => {
    if (!trackRef.current) return;
    
    const container = trackRef.current;
    const containerWidth = container.clientWidth;
    const scrollLeft = container.scrollLeft;
    const centerX = scrollLeft + containerWidth / 2;
    
    // Вычисляем дату в центре экрана
    let centerDate;
    if (timeScale === 'days') {
      const dayIndex = Math.floor(centerX / pxPerDay);
      centerDate = new Date(visibleStart);
      centerDate.setDate(centerDate.getDate() + dayIndex);
    } else if (timeScale === 'weeks') {
      const weekIndex = Math.floor(centerX / pxPerWeek);
      const weekStart = new Date(visibleStart);
      const dayOfWeek = weekStart.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      weekStart.setDate(weekStart.getDate() + mondayOffset);
      centerDate = new Date(weekStart);
      centerDate.setDate(centerDate.getDate() + weekIndex * 7);
    } else if (timeScale === 'months') {
      const monthIndex = Math.floor(centerX / pxPerMonth);
      centerDate = new Date(visibleStart.getFullYear(), visibleStart.getMonth() + monthIndex, 1);
    }
    
    if (centerDate) {
      setFocusedDate(centerDate);
    }
  };

  // Функция для переключения режима с сохранением фокуса
  const changeTimeScale = (newScale) => {
    const currentFocusedDate = focusedDate;
    setTimeScale(newScale);
    
    // После изменения режима прокручиваем к сохраненной дате
    setTimeout(() => {
      if (!trackRef.current) return;
      
      let targetX = 0;
      if (newScale === 'days') {
        const daysDiff = Math.floor((currentFocusedDate - visibleStart) / (1000 * 60 * 60 * 24));
        targetX = daysDiff * pxPerDay;
      } else if (newScale === 'weeks') {
        const weekStart = new Date(visibleStart);
        const dayOfWeek = weekStart.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        weekStart.setDate(weekStart.getDate() + mondayOffset);
        const weeksDiff = Math.floor((currentFocusedDate - weekStart) / (1000 * 60 * 60 * 24 * 7));
        targetX = weeksDiff * pxPerWeek;
      } else if (newScale === 'months') {
        const monthsDiff = (currentFocusedDate.getFullYear() - visibleStart.getFullYear()) * 12 + 
                          (currentFocusedDate.getMonth() - visibleStart.getMonth());
        targetX = monthsDiff * pxPerMonth;
      }
      
      // Прокручиваем к целевой позиции
      const container = trackRef.current;
      const containerWidth = container.clientWidth;
      const scrollLeft = targetX - containerWidth / 2;
      container.scrollLeft = Math.max(0, scrollLeft);
    }, 50);
  };
  // Фильтруем классифицированные задачи
  const classifiedTasks = tasks.filter(task => 
    task.importance && task.complexity && 
    task.importance !== 'undefined' && task.complexity !== 'undefined' &&
    task.importance !== null && task.complexity !== null
  );

  // Типы задач для таблицы с уникальными цветами
  const taskTypes = [
    { id: 'high-high', label: 'Важно/Сложно', color: '#dc2626' }, // Красный - критично
    { id: 'high-medium', label: 'Важно/Средне', color: '#ea580c' }, // Оранжевый - срочно
    { id: 'high-low', label: 'Важно/Просто', color: '#d97706' }, // Янтарный - важно
    { id: 'medium-high', label: 'Средне/Сложно', color: '#2563eb' }, // Синий - сложно
    { id: 'medium-medium', label: 'Средне/Средне', color: '#7c3aed' }, // Фиолетовый - обычное
    { id: 'medium-low', label: 'Средне/Просто', color: '#0891b2' }, // Голубой - простое
    { id: 'low-high', label: 'Минимум/Сложно', color: '#059669' }, // Зеленый - низкий приоритет
    { id: 'low-medium', label: 'Минимум/Средне', color: '#16a34a' }, // Светло-зеленый
    { id: 'low-low', label: 'Минимум/Просто', color: '#22c55e' } // Ярко-зеленый - минимальный
  ];

  // Дни диапазона: от 2025-06-01 до конца месяца через год от сегодня
  const now = new Date();
  const visibleStart = new Date(2025, 5, 1); // 1 июня 2025
  const visibleEnd = new Date(now.getFullYear() + 1, now.getMonth() + 1, 0); // конец месяца через год
  
  // Timeline range: June 2025 to one year from now

  // Синхронизация скролла убрана - хедер фиксирован

  const days = useMemo(() => {
    const arr = [];
    const d = new Date(visibleStart);
    while (d <= visibleEnd) {
      arr.push({ key: d.toISOString().substring(0, 10), date: new Date(d) });
      d.setDate(d.getDate() + 1);
    }
    return arr;
  }, [visibleStart, visibleEnd]);

  // Генерация недель
  const weeks = useMemo(() => {
    const arr = [];
    const d = new Date(visibleStart);
    // Начинаем с понедельника недели
    const dayOfWeek = d.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    d.setDate(d.getDate() + mondayOffset);
    
    while (d <= visibleEnd) {
      const weekStart = new Date(d);
      const weekEnd = new Date(d);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      arr.push({ 
        key: weekStart.toISOString().substring(0, 10), 
        start: new Date(weekStart),
        end: new Date(weekEnd)
      });
      d.setDate(d.getDate() + 7);
    }
    return arr;
  }, [visibleStart, visibleEnd]);

  // Генерация месяцев
  const months = useMemo(() => {
    const arr = [];
    const d = new Date(visibleStart.getFullYear(), visibleStart.getMonth(), 1);
    
    while (d <= visibleEnd) {
      const monthStart = new Date(d);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      
      arr.push({ 
        key: monthStart.toISOString().substring(0, 7), // YYYY-MM формат
        start: new Date(monthStart),
        end: new Date(monthEnd)
      });
      d.setMonth(d.getMonth() + 1);
    }
    return arr;
  }, [visibleStart, visibleEnd]);

  // Вспомогательные для дат
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  const getTasksForLane = (typeId) => {
    const tasks = classifiedTasks.filter(t => `${t.importance}-${t.complexity}` === typeId);
    
    // Сортируем задачи по времени создания для стабильного порядка
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.created_at || a.id) - new Date(b.created_at || b.id));
    
    // Назначаем вертикальные позиции с учетом пересечений
    const taskPositions = new Map();
    
    sortedTasks.forEach(task => {
      if (!task.startDate) {
        task.verticalPosition = 0;
        return;
      }
      
      const taskStart = startOfDay(new Date(task.startDate));
      const taskEnd = task.endDate ? startOfDay(new Date(task.endDate)) : taskStart;
      
      // Находим все дни, которые пересекает эта задача
      const taskDays = [];
      const currentDay = new Date(taskStart);
      while (currentDay <= taskEnd) {
        taskDays.push(currentDay.toISOString().substring(0, 10));
        currentDay.setDate(currentDay.getDate() + 1);
      }
      
      // Находим минимальную свободную позицию для всех дней задачи
      let position = 0;
      let found = false;
      
      while (!found) {
        let canUsePosition = true;
        
        // Проверяем, не занята ли эта позиция в любой из дней задачи
        for (const day of taskDays) {
          if (taskPositions.has(day) && taskPositions.get(day).has(position)) {
            canUsePosition = false;
            break;
          }
        }
        
        if (canUsePosition) {
          found = true;
        } else {
          position++;
          }
        }
      
      // Занимаем позицию для всех дней задачи
      for (const day of taskDays) {
        if (!taskPositions.has(day)) {
          taskPositions.set(day, new Set());
        }
        taskPositions.get(day).add(position);
      }
      
      task.verticalPosition = position;
    });
    
    return tasks;
  };

  // Вычисляем максимальную высоту дорожки на основе количества задач
  const getLaneHeight = (typeId) => {
    const tasks = getTasksForLane(typeId);
    if (tasks.length === 0) return 80; // минимальная высота
    
    const maxVerticalPosition = Math.max(...tasks.map(t => t.verticalPosition || 0));
    return Math.max(80, 40 + (maxVerticalPosition + 1) * 28); // 40px базовый отступ + 28px на задачу (24px высота + 4px отступ)
  };

  // Функция для получения начала недели (понедельник)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Понедельник = 1, воскресенье = 0
    d.setDate(d.getDate() + diff);
    return startOfDay(d);
  };

  const xFromDate = (date) => {
    const taskDate = startOfDay(new Date(date));
    const timelineStart = startOfDay(visibleStart);
    
    if (timeScale === 'weeks') {
      // Для недель находим начало недели для задачи
      const taskWeekStart = getWeekStart(taskDate);
      const timelineWeekStart = getWeekStart(timelineStart);
      
      // Считаем разность в неделях
      const weeksDiff = Math.floor((taskWeekStart.getTime() - timelineWeekStart.getTime()) / (7*24*60*60*1000));
      
      // Добавляем смещение внутри недели (день недели * pxPerDayInWeeks)
      const dayOfWeek = taskDate.getDay() === 0 ? 6 : taskDate.getDay() - 1; // Понедельник = 0
      const pxPerDayInWeeks = pxPerWeek / 7;
      
      const result = Math.max(0, weeksDiff * pxPerWeek + dayOfWeek * pxPerDayInWeeks);
      console.log(`xFromDate weeks: date=${taskDate.toISOString().substring(0, 10)}, weeksDiff=${weeksDiff}, dayOfWeek=${dayOfWeek}, result=${Math.round(result)}`);
      return result;
    } else if (timeScale === 'months') {
      // Для месяцев
      const taskMonthStart = new Date(taskDate.getFullYear(), taskDate.getMonth(), 1);
      const timelineMonthStart = new Date(timelineStart.getFullYear(), timelineStart.getMonth(), 1);
      
      // Считаем разность в месяцах
      const monthsDiff = (taskMonthStart.getFullYear() - timelineMonthStart.getFullYear()) * 12 + 
                        (taskMonthStart.getMonth() - timelineMonthStart.getMonth());
      
      // Добавляем смещение внутри месяца (день месяца * pxPerDayInMonth)
      const dayOfMonth = taskDate.getDate() - 1; // День месяца (0-30)
      const pxPerDayInMonth = pxPerMonth / 31; // Примерно 31 день в месяце
      
      const result = Math.max(0, monthsDiff * pxPerMonth + dayOfMonth * pxPerDayInMonth);
      console.log(`xFromDate months: date=${taskDate.toISOString().substring(0, 10)}, monthsDiff=${monthsDiff}, dayOfMonth=${dayOfMonth}, result=${Math.round(result)}`);
      return result;
    } else {
      // Для дней
      const daysDiff = Math.floor((taskDate.getTime() - timelineStart.getTime()) / (24*60*60*1000));
      return Math.max(0, daysDiff * pxPerDay);
    }
  };
  const widthFromRange = (start, end) => {
    const s = startOfDay(new Date(start));
    const e = end ? endOfDay(new Date(end)) : endOfDay(visibleEnd);
    
    if (timeScale === 'weeks') {
      // В режиме недель считаем по дням, но с недельным масштабом
      const daysCount = Math.max(1, Math.floor((e.getTime() - s.getTime()) / (24*60*60*1000)) + 1);
      const pxPerDayInWeeks = pxPerWeek / 7; // пикселей на день в недельном режиме
      return daysCount * pxPerDayInWeeks;
    } else if (timeScale === 'months') {
      // В режиме месяцев считаем по дням, но с месячным масштабом
      const daysCount = Math.max(1, Math.floor((e.getTime() - s.getTime()) / (24*60*60*1000)) + 1);
      const pxPerDayInMonth = pxPerMonth / 31; // пикселей на день в месячном режиме
      return daysCount * pxPerDayInMonth;
    } else {
      const daysCount = Math.max(1, Math.floor((e.getTime() - s.getTime()) / (24*60*60*1000)) + 1);
      return daysCount * pxPerDay;
    }
  };

  const handleDragOver = (e, laneTypeId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Определяем точную зону наведения
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    let targetDate, zoneWidth, alignedX;
    if (timeScale === 'weeks') {
      // Находим начало недели для timelineStart
      const timelineWeekStart = getWeekStart(visibleStart);
      
      // Считаем разность в неделях
      const weeksDiff = Math.floor(x / pxPerWeek);
      
      // Добавляем смещение внутри недели
      const dayOfWeek = Math.floor((x % pxPerWeek) / (pxPerWeek / 7));
      // Используем ту же логику, что и в xFromDate: Понедельник = 0, Воскресенье = 6
      const dayOfWeekCorrected = dayOfWeek;
      
      targetDate = new Date(timelineWeekStart);
      targetDate.setDate(targetDate.getDate() + weeksDiff * 7 + dayOfWeekCorrected);
      zoneWidth = pxPerWeek / 7; // ширина одного дня в недельном режиме
      alignedX = weeksDiff * pxPerWeek + dayOfWeek * zoneWidth - 50; // Граница между днями в неделе, убираем 50px отступ
      
      console.log(`Weeks drag: x=${Math.round(x)}, week=${weeksDiff}, day=${dayOfWeekCorrected}, target=${targetDate.toISOString().substring(0, 10)}`);
    } else if (timeScale === 'months') {
      // Находим начало месяца для timelineStart
      const timelineMonthStart = new Date(visibleStart.getFullYear(), visibleStart.getMonth(), 1);
      
      // Считаем разность в месяцах
      const monthsDiff = Math.floor(x / pxPerMonth);
      
      // Добавляем смещение внутри месяца
      const dayOfMonth = Math.floor((x % pxPerMonth) / (pxPerMonth / 31));
      
      targetDate = new Date(timelineMonthStart);
      targetDate.setMonth(targetDate.getMonth() + monthsDiff);
      targetDate.setDate(dayOfMonth + 1);
      zoneWidth = pxPerMonth / 31; // ширина одного дня в месячном режиме
      alignedX = monthsDiff * pxPerMonth + dayOfMonth * zoneWidth - 50; // Граница между днями в месяце, убираем 50px отступ
      
      console.log(`Months drag: x=${Math.round(x)}, month=${monthsDiff}, day=${dayOfMonth}, target=${targetDate.toISOString().substring(0, 10)}`);
    } else {
      // Для дней - точно выравниваем по границам
      const daysDiff = Math.floor(x / pxPerDay);
      targetDate = new Date(visibleStart);
      targetDate.setDate(targetDate.getDate() + daysDiff);
      zoneWidth = pxPerDay; // ширина одного дня
      alignedX = (daysDiff + 1) * pxPerDay - 21; // Граница между днями, убираем 20px отступ
    }
    
    // Используем ref вместо dataTransfer
    const task = currentDragTask.current;
    
    if (task) {
      // Определяем тип задачи из перетаскиваемой задачи
      const taskTypeId = `${task.importance}-${task.complexity}`;
      const periodKey = targetDate.toISOString().substring(0, 10);
      
      console.log('DragOver:', { 
        taskType: taskTypeId, 
        laneType: laneTypeId,
        targetDate, 
        alignedX, 
        zoneWidth,
        mouseX: x 
      });
      
      setHoverZone({ 
        typeId: laneTypeId, // Используем тип дорожки, а не задачи
        periodKey, 
        date: targetDate, 
        x: alignedX, // точное выравнивание по границам
        width: zoneWidth // полная ширина дня
      });
    }
  };

  const handleDragLeave = (e) => {
    // Сбрасываем подсветку при выходе из зоны
    setHoverZone(null);
  };

  const handleDragEnd = (e) => {
    // Очищаем ref при завершении перетаскивания
    currentDragTask.current = null;
    setHoverZone(null);
    
    // Восстанавливаем прозрачность
    e.target.style.opacity = '1';
  };

  const handleDrop = (e, typeId, periodKey) => {
    e.preventDefault();
    setHoverZone(null); // Сбрасываем подсветку после дропа
    currentDragTask.current = null; // Очищаем ref
    try {
      const taskData = JSON.parse(e.dataTransfer.getData('application/json'));
      // console.log('Drop taskData:', taskData);
      
      const [importance, complexity] = typeId.split('-');
      
      let targetDate;
      if (timeScale === 'weeks') {
        // Используем ту же логику, что и в handleDragOver
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        
        // Находим начало недели для timelineStart
        const timelineWeekStart = getWeekStart(visibleStart);
        
        // Считаем разность в неделях
        const weeksDiff = Math.floor(x / pxPerWeek);
        
        // Добавляем смещение внутри недели
        const dayOfWeek = Math.floor((x % pxPerWeek) / (pxPerWeek / 7));
        // Используем ту же логику, что и в xFromDate: Понедельник = 0, Воскресенье = 6
        const dayOfWeekCorrected = dayOfWeek;
        
        targetDate = new Date(timelineWeekStart);
        targetDate.setDate(targetDate.getDate() + weeksDiff * 7 + dayOfWeekCorrected);
        
        console.log(`Weeks drop: x=${Math.round(x)}, week=${weeksDiff}, day=${dayOfWeekCorrected}, final=${targetDate.toISOString().substring(0, 10)}`);
      } else if (timeScale === 'months') {
        // Используем ту же логику, что и в handleDragOver
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        
        // Находим начало месяца для timelineStart
        const timelineMonthStart = new Date(visibleStart.getFullYear(), visibleStart.getMonth(), 1);
        
        // Считаем разность в месяцах
        const monthsDiff = Math.floor(x / pxPerMonth);
        
        // Добавляем смещение внутри месяца
        const dayOfMonth = Math.floor((x % pxPerMonth) / (pxPerMonth / 31));
        
        targetDate = new Date(timelineMonthStart);
        targetDate.setMonth(targetDate.getMonth() + monthsDiff);
        targetDate.setDate(dayOfMonth + 1);
        
        console.log(`Months drop: x=${Math.round(x)}, month=${monthsDiff}, day=${dayOfMonth}, final=${targetDate.toISOString().substring(0, 10)}`);
      } else {
        targetDate = new Date(periodKey);
      }
      
      if (Number.isNaN(targetDate.getTime())) return;
      
      // Duration: preserve existing duration, default 3 days for new tasks
      const defaultDurationDays = 3;
      let durationDays = defaultDurationDays;
      
      // Если у задачи уже есть startDate и endDate, сохраняем длительность
      if (taskData.startDate && taskData.endDate) {
        const s = startOfDay(new Date(taskData.startDate));
        const e = startOfDay(new Date(taskData.endDate));
        const daysDiff = Math.floor((e.getTime() - s.getTime()) / (24*60*60*1000));
        durationDays = Math.max(1, daysDiff + 1); // +1 потому что включаем оба дня
        // console.log(`Preserving duration: ${durationDays} days for task ${taskData.id}`);
      }
      const newStart = startOfDay(targetDate);
      const newEnd = new Date(newStart);
      newEnd.setDate(newEnd.getDate() + (durationDays - 1));

      const updatedTask = {
        ...taskData,
        importance,
        complexity,
        startDate: newStart.toISOString(),
        endDate: newEnd.toISOString()
      };

      // console.log(`Task ${taskData.id} moved to ${dayKey}, duration: ${durationDays} days`);
      onTaskUpdate(updatedTask);
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  // Resize logic: drag right handle to extend endDate by whole days
  const startRightResize = (e, task) => {
    e.preventDefault();
    e.stopPropagation(); // Предотвращаем всплытие события
    
    const originX = e.clientX;
    const originStart = new Date(task.startDate);
    const originEnd = task.endDate ? new Date(task.endDate) : new Date(task.startDate);
    let isResizing = true;

    const onMove = (ev) => {
      if (!isResizing) return;
      const deltaPx = ev.clientX - originX;
      
      if (timeScale === 'weeks') {
        // Для недель используем тот же шаг в 1 день, но с недельным масштабом
        const pxPerDayInWeeks = pxPerWeek / 7; // пикселей на день в недельном режиме
        const daysDelta = Math.round(deltaPx / pxPerDayInWeeks); // шаг в 1 день
        
        const currentDuration = Math.floor((originEnd.getTime() - originStart.getTime()) / (24*60*60*1000)) + 1;
        const newDuration = Math.max(1, currentDuration + daysDelta);
        const newEnd = new Date(originStart);
        newEnd.setDate(newEnd.getDate() + newDuration - 1);
        
        if (newEnd < originStart) return;
        
        onTaskUpdate({ ...task, endDate: newEnd.toISOString() });
      } else {
        // Для дней
        const daysDelta = Math.round(deltaPx / pxPerDay);
        
        const currentDuration = Math.floor((originEnd.getTime() - originStart.getTime()) / (24*60*60*1000)) + 1;
        const newDuration = Math.max(1, currentDuration + daysDelta);
        const newEnd = new Date(originStart);
        newEnd.setDate(newEnd.getDate() + newDuration - 1);
        
        if (newEnd < originStart) return;
        
        onTaskUpdate({ ...task, endDate: newEnd.toISOString() });
      }
    };

    const onUp = () => {
      isResizing = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleTaskDragStart = (e, task) => {
    try {
      // Получаем актуальные данные задачи из состояния
      const currentTask = classifiedTasks.find(t => t.id === task.id) || task;
      console.log('Drag start - current task data:', currentTask);
      
      // Сохраняем задачу в ref для использования в handleDragOver
      currentDragTask.current = currentTask;
      
      // Делаем элемент полупрозрачным во время перетаскивания
      e.target.style.opacity = '0.5';
      
      e.dataTransfer.setData('application/json', JSON.stringify(currentTask));
      e.dataTransfer.effectAllowed = 'move';
    } catch (err) {
      console.error('Error starting drag:', err);
    }
  };

  return (
    <div className="task-matrix">
      <div className="matrix-container">
        <div className="importance-header-fixed">
          <div className="lane-label" style={{ width: 140 }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057' }}>Важность</div>
          </div>
        </div>
        {/* Вертикальный переключатель режимов времени */}
        <div className="time-scale-controls-vertical">
          <div className="segmented-control">
            <button 
              onClick={() => changeTimeScale('days')}
              className={`segment ${timeScale === 'days' ? 'active' : ''}`}
            >
              Д
            </button>
            <button 
              onClick={() => changeTimeScale('weeks')}
              className={`segment ${timeScale === 'weeks' ? 'active' : ''}`}
            >
              Н
            </button>
            <button 
              onClick={() => changeTimeScale('months')}
              className={`segment ${timeScale === 'months' ? 'active' : ''}`}
            >
              М
            </button>
          </div>
        </div>
        <div className="lanes" ref={trackRef} onScroll={updateFocusedDate}>
          <div className="timeline-content" style={{ width: (timeScale === 'weeks' ? weeks.length * pxPerWeek : timeScale === 'months' ? months.length * pxPerMonth : days.length * pxPerDay) + 140 }}>
            <div className="day-header">
              <div className="lane-label" style={{ width: 140 }} />
              {timeScale === 'weeks' ? (
                weeks.map(w => {
                  const weekStart = w.start.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
                  const weekEnd = w.end.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
                  return (
                    <div key={w.key} className="day-cell" style={{ width: pxPerWeek }}>
                      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Неделя</div>
                      <div style={{ fontSize: '9px' }}>{weekStart} - {weekEnd}</div>
                    </div>
                  );
                })
              ) : timeScale === 'months' ? (
                months.map(m => {
                  const monthName = m.start.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
                  return (
                    <div key={m.key} className="day-cell" style={{ width: pxPerMonth }}>
                      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Месяц</div>
                      <div style={{ fontSize: '9px' }}>{monthName}</div>
                    </div>
                  );
                })
              ) : (
                days.map(d => {
                  const weekday = d.date.toLocaleDateString('ru-RU', { weekday: 'short' });
                  const dayStr = d.date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  return (
                    <div key={d.key} className="day-cell" style={{ width: pxPerDay }}>
                      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>{weekday}</div>
                      <div style={{ fontSize: '9px' }}>{dayStr}</div>
                    </div>
                  );
                })
              )}
            </div>
          {taskTypes.map((type) => (
            <div key={type.id} className="lane" style={{ minHeight: getLaneHeight(type.id) }}>
              <div 
                className="lane-label"
                style={{
                  backgroundColor: type.color + '20', // полупрозрачный фон
                  color: type.color,
                  fontWeight: 'bold'
                }}
              >
                {type.label}
              </div>
              <div 
                className="lane-track"
                style={{ 
                  height: getLaneHeight(type.id),
                  backgroundImage: timeScale === 'weeks' 
                    ? `repeating-linear-gradient(90deg, transparent, transparent ${pxPerWeek - 1}px, #00ff00 ${pxPerWeek - 1}px, #00ff00 ${pxPerWeek}px, transparent ${pxPerWeek}px, transparent ${pxPerWeek}px)`
                    : timeScale === 'months'
                    ? `repeating-linear-gradient(90deg, transparent, transparent ${pxPerMonth - 1}px, #00ff00 ${pxPerMonth - 1}px, #00ff00 ${pxPerMonth}px, transparent ${pxPerMonth}px, transparent ${pxPerMonth}px)`
                    : `repeating-linear-gradient(90deg, transparent, transparent ${pxPerDay - 1}px, #00ff00 ${pxPerDay - 1}px, #00ff00 ${pxPerDay}px, transparent ${pxPerDay}px, transparent ${7 * pxPerDay}px)`,
                  backgroundColor: 'transparent',
                  position: 'relative'
                }}
                onDragOver={(e) => handleDragOver(e, type.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => {
                  // Находим ближайший период по позиции мыши
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  
                  if (timeScale === 'weeks') {
                    // В режиме недель находим день внутри недели
                    const pxPerDayInWeeks = pxPerWeek / 7;
                    const dayIndex = Math.floor(x / pxPerDayInWeeks);
                    const targetDay = days[dayIndex];
                    if (targetDay) {
                      handleDrop(e, type.id, targetDay.key);
                    }
                  } else if (timeScale === 'months') {
                    // В режиме месяцев находим день внутри месяца
                    const pxPerDayInMonth = pxPerMonth / 31;
                    const dayIndex = Math.floor(x / pxPerDayInMonth);
                    const targetDay = days[dayIndex];
                    if (targetDay) {
                      handleDrop(e, type.id, targetDay.key);
                    }
                  } else {
                    const dayIndex = Math.floor(x / pxPerDay);
                    const targetDay = days[dayIndex];
                    if (targetDay) {
                      handleDrop(e, type.id, targetDay.key);
                    }
                  }
                }}
              >
                {getTasksForLane(type.id).map(task => {
                  // Находим цвет для типа задачи
                  const taskType = taskTypes.find(t => t.id === type.id);
                  const taskColor = taskType ? taskType.color : '#d4edda';
                  
                  return (
                    <div
                      key={task.id}
                      className="task-bar"
                      draggable
                      onDragStart={(e) => handleTaskDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      title={task.description || task.title}
                      style={{
                        left: xFromDate(task.startDate),
                        width: widthFromRange(task.startDate, task.endDate),
                        top: 8 + (task.verticalPosition || 0) * 28, // вертикальное смещение (24px высота + 4px отступ)
                        backgroundColor: taskColor,
                        borderColor: taskColor,
                        color: '#ffffff',
                        fontWeight: 'bold'
                      }}
                    >
                      <div className="task-bar-content">{task.title}</div>
                      <span 
                        className="resize-handle" 
                        onMouseDown={(ev) => {
                          ev.stopPropagation();
                          startRightResize(ev, task);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              {/* Направляющая линия */}
              {hoverZone && hoverZone.typeId === type.id && (
                <div 
                  style={{
                    position: 'absolute',
                    left: hoverZone.x,
                    top: 0,
                    width: '2px',
                    height: '100%',
                    backgroundColor: '#007bff',
                    pointerEvents: 'none',
                    zIndex: 10,
                    boxShadow: '0 0 4px rgba(0, 123, 255, 0.8)'
                  }}
                />
              )}
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskMatrix;