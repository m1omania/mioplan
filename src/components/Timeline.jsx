import React, { useState, useMemo } from 'react';
import ReactCalendarTimeline from 'react-calendar-timeline';
import 'react-calendar-timeline/lib/Timeline.css';
import moment from 'moment';
import './Timeline.css';

const TimelineView = ({ tasks, onTaskUpdate }) => {
  // 9 групп для классификации задач
  const groups = useMemo(() => {
    const importanceLevels = ['high', 'medium', 'low'];
    const complexityLevels = ['high', 'medium', 'low'];
    
    const groups = [];
    let id = 1;
    
    importanceLevels.forEach(importance => {
      complexityLevels.forEach(complexity => {
        const importanceLabel = {
          'high': 'Важно',
          'medium': 'Средне', 
          'low': 'Минимум'
        }[importance];
        
        const complexityLabel = {
          'high': 'Сложно',
          'medium': 'Средне',
          'low': 'Просто'
        }[complexity];
        
        groups.push({
          id: `${importance}-${complexity}`,
          title: `${importanceLabel} / ${complexityLabel}`,
          importance,
          complexity
        });
      });
    });
    
    return groups;
  }, []);

  // Преобразуем задачи в элементы таймлайна
  const items = useMemo(() => {
    return tasks.map(task => {
      // Если у задачи нет дат, устанавливаем дефолтные
      const startDate = task.startDate ? moment(task.startDate) : moment().startOf('day');
      const endDate = task.endDate ? moment(task.endDate) : moment().add(1, 'week').startOf('day');
      
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        start_time: startDate,
        end_time: endDate,
        group: `${task.importance}-${task.complexity}`,
        importance: task.importance,
        complexity: task.complexity,
        tags: task.tags || []
      };
    });
  }, [tasks]);

  // Обработчик перемещения задачи
  const handleItemMove = (itemId, dragTime, newGroupOrder) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const groupId = groups[newGroupOrder].id;
    const [importance, complexity] = groupId.split('-');
    
    // Сохраняем исходную продолжительность
    const originalDuration = moment(item.end_time).diff(moment(item.start_time));
    const newStartDate = moment(dragTime);
    const newEndDate = newStartDate.clone().add(originalDuration);
    
    const updatedTask = {
      ...item,
      id: itemId,
      startDate: newStartDate.toISOString(),
      endDate: newEndDate.toISOString(),
      importance,
      complexity
    };
    
    onTaskUpdate(updatedTask);
  };

  // Обработчик изменения размера задачи
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
    
    // Убеждаемся, что дата начала не позже даты окончания
    if (startDate.isSameOrAfter(endDate)) {
      if (edge === 'left') {
        endDate = startDate.clone().add(1, 'hour');
      } else {
        startDate = endDate.clone().subtract(1, 'hour');
      }
    }
    
    const updatedTask = {
      id: itemId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
    
    onTaskUpdate(updatedTask);
  };

  // Кастомный рендерер для элементов
  const itemRenderer = ({ item, timelineContext, itemContext, getItemProps, getResizeProps }) => {
    const { title, importance, complexity, tags } = item;
    
    // Цвета для разных типов задач
    const getItemColor = (importance, complexity) => {
      if (importance === 'high' && complexity === 'high') return '#ef4444'; // Красный
      if (importance === 'high') return '#f97316'; // Оранжевый
      if (complexity === 'high') return '#eab308'; // Желтый
      return '#22c55e'; // Зеленый
    };
    
    const itemColor = getItemColor(importance, complexity);
    
    return (
      <div
        {...getItemProps({
          style: {
            backgroundColor: itemColor,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '12px',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            ...getItemProps().style
          }
        })}
      >
        <div style={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {title}
        </div>
        {tags.length > 0 && (
          <div style={{ 
            fontSize: '10px', 
            opacity: 0.8,
            marginTop: '2px'
          }}>
            {tags.slice(0, 2).join(', ')}
          </div>
        )}
        <div {...getResizeProps('left')} />
        <div {...getResizeProps('right')} />
      </div>
    );
  };

  return (
    <div className="timeline-container">
      <ReactCalendarTimeline
        groups={groups}
        items={items}
        defaultTimeStart={moment().add(-1, 'month')}
        defaultTimeEnd={moment().add(3, 'month')}
        itemRenderer={itemRenderer}
        onItemMove={handleItemMove}
        onItemResize={handleItemResize}
        canMove={true}
        canResize="both"
        stackItems={true}
        showCursorLine={true}
        sidebarWidth={180}
        lineHeight={50}
        itemHeightRatio={0.75}
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
