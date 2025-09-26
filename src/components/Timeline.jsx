import React, { useState, useMemo } from 'react';
import Timeline from 'react-calendar-timeline';
import 'react-calendar-timeline/dist/style.css';
import moment from 'moment';
import './Timeline.css';
import CustomTimelineItem from './CustomTimelineItem';
import TaskOverlapNotification from './TaskOverlapNotification';

const TimelineView = ({ tasks, onTaskUpdate, onTaskDelete }) => {
  // Группируем задачи по секторам для отображения на таймлайне
  const groups = useMemo(() => {
    const sectors = [
      { id: 'high-high', title: 'Важно / Сложно' },
      { id: 'high-medium', title: 'Важно / Средне' },
      { id: 'high-low', title: 'Важно / Просто' },
      { id: 'medium-high', title: 'Средне / Сложно' },
      { id: 'medium-medium', title: 'Средне / Средне' },
      { id: 'medium-low', title: 'Средне / Просто' },
      { id: 'low-high', title: 'Минимум / Сложно' },
      { id: 'low-medium', title: 'Минимум / Средне' },
      { id: 'low-low', title: 'Минимум / Просто' }
    ];
    
    return sectors.map(sector => ({
      id: sector.id,
      title: sector.title
    }));
  }, []);

  // Преобразуем задачи в элементы таймлайна
  const items = useMemo(() => {
    return tasks.map(task => {
      // Если у задачи еще нет дат, установим дефолтные значения
      const startDate = task.startDate ? moment(task.startDate) : moment().startOf('day');
      const endDate = task.endDate ? moment(task.endDate) : moment().add(1, 'week').startOf('day');
      
      return {
        ...task,
        start_time: startDate,
        end_time: endDate,
        group: `${task.importance}-${task.complexity}`
      };
    });
  }, [tasks]);

  // Обработчик изменения элемента на таймлайне
  const handleItemMove = (itemId, dragTime, newGroupOrder) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const groupId = groups[newGroupOrder].id;
    const [importance, complexity] = groupId.split('-');
    
    const updatedTask = {
      ...item,
      id: itemId,
      startDate: moment(dragTime),
      endDate: moment(dragTime).add(1, 'week'), // По умолчанию продолжительность 1 неделя
      importance,
      complexity
    };
    
    onTaskUpdate(updatedTask);
  };

  // Обработчик изменения размера элемента
  const handleItemResize = (itemId, time, edge) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    let startDate, endDate;
    
    if (edge === 'left') {
      startDate = moment(time);
      endDate = item.end_time;
    } else {
      startDate = item.start_time;
      endDate = moment(time);
    }
    
    // Убедимся, что дата начала не позже даты окончания
    if (startDate.isSameOrAfter(endDate)) {
      if (edge === 'left') {
        endDate = startDate.clone().add(1, 'hour');
      } else {
        startDate = endDate.clone().subtract(1, 'hour');
      }
    }
    
    const updatedTask = {
      id: itemId,
      startDate,
      endDate
    };
    
    onTaskUpdate(updatedTask);
  };

  // Обработчик удаления задачи
  const handleItemDelete = (itemId) => {
    onTaskDelete(itemId);
  };

  // Создаем кастомные заголовки для времени
  const formatTimeHeader = (time, unit, width) => {
    if (unit === 'month') {
      return moment(time).format('MMM YYYY');
    } else if (unit === 'day') {
      // Показываем номер недели и день недели для каждого дня
      const dayOfWeek = moment(time).format('dd');
      const weekNumber = moment(time).isoWeek();
      return (
        <div className="day-header">
          <div className="week-number">W{weekNumber}</div>
          <div className="day-name">{dayOfWeek}</div>
          <div className="day-number">{moment(time).format('D')}</div>
        </div>
      );
    }
    return moment(time).format('D');
  };

  return (
    <div className="timeline-container">
      <TaskOverlapNotification tasks={tasks} />
      <Timeline
        groups={groups}
        items={items}
        defaultTimeStart={moment().add(-1, 'month')}
        defaultTimeEnd={moment().add(3, 'month')}
        itemRenderer={({ item, timelineContext, itemContext, getItemProps, getResizeProps }) => (
          <CustomTimelineItem
            item={item}
            timelineContext={timelineContext}
            itemContext={itemContext}
            getItemProps={getItemProps}
            getResizeProps={getResizeProps}
            onDelete={handleItemDelete}
          />
        )}
        onItemMove={handleItemMove}
        onItemResize={handleItemResize}
        itemHeightRatio={0.75}
        canMove={true}
        canResize={'both'}
        canSelect={true}
        stackItems={true}
        itemTouchSendsClick={false}
        showCursorLine={true}
        sidebarWidth={150}
        rightSidebarWidth={0}
        lineHeight={50}
        headerLabelFormats={{
          yearShort: 'YY',
          yearLong: 'YYYY',
          monthShort: 'MMM',
          monthMedium: 'MMMM YYYY',
          monthLong: 'MMMM YYYY',
          dayShort: 'D',
          dayLong: 'dddd, D',
          hourShort: 'HH',
          hourMedium: 'HH:mm',
          hourLong: 'HH:mm'
        }}
        subHeaderLabelFormats={{
          yearShort: 'YY',
          yearLong: 'YYYY',
          monthShort: 'MMM',
          monthMedium: 'MMMM',
          monthLong: 'MMMM',
          dayShort: 'D',
          dayLong: 'dddd D',
          hourShort: 'HH',
          hourMedium: 'HH:mm',
          hourLong: 'HH:mm'
        }}
      />
    </div>
  );
};

export default TimelineView;