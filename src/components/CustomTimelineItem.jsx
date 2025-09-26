import React, { useState } from 'react';
import CriticalTaskIndicator from './CriticalTaskIndicator';

const CustomTimelineItem = ({ item, timelineContext, itemContext, getItemProps, getResizeProps, onDelete }) => {
  const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Определяем классы стилей в зависимости от важности и сложности
  const getSectorClass = (importance, complexity) => {
    return `sector-${importance}-${complexity}`;
  };

  const getSectorLabel = (importance, complexity) => {
    const labels = {
      'high-high': 'Важно/Сложно',
      'high-medium': 'Важно/Средне',
      'high-low': 'Важно/Просто',
      'medium-high': 'Средне/Сложно',
      'medium-medium': 'Средне/Средне',
      'medium-low': 'Средне/Просто',
      'low-high': 'Минимум/Сложно',
      'low-medium': 'Минимум/Средне',
      'low-low': 'Минимум/Просто'
    };
    return labels[`${importance}-${complexity}`] || '';
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  const handleMouseEnter = (e) => {
    setShowTooltip(true);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleMouseMove = (e) => {
    if (showTooltip) {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <>
      <div
        {...getItemProps({
          style: {
            backgroundColor: itemContext.selected ? 'rgba(168, 216, 234, 0.8)' : 'white',
            color: 'black',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          },
        })}
        className={`timeline-item ${getSectorClass(item.importance, item.complexity)}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <CriticalTaskIndicator task={item} />
        {itemContext.useResizeLeft ? <div {...leftResizeProps} className="resize-left-handle" /> : null}
        {itemContext.useResizeRight ? <div {...rightResizeProps} className="resize-right-handle" /> : null}
        
        <div className="timeline-item-content">
          <div className="timeline-item-header">
            <div className="timeline-item-title">{item.title}</div>
            <button className="timeline-item-delete" onClick={handleDelete}>×</button>
          </div>
          <div className="timeline-item-sector">{getSectorLabel(item.importance, item.complexity)}</div>
          {item.description && (
            <div className="timeline-item-description">{item.description}</div>
          )}
          {item.tags && item.tags.length > 0 && (
            <div className="timeline-item-tags">
              {item.tags.map((tag, index) => (
                <span key={index} className="timeline-item-tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {showTooltip && (
        <div 
          className="timeline-item-tooltip"
          style={{
            position: 'fixed',
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y + 10,
            zIndex: 1000
          }}
        >
          <div className="tooltip-content">
            <h4>{item.title}</h4>
            {item.description && (
              <p>{item.description}</p>
            )}
            <div className="tooltip-sector">
              Сектор: {getSectorLabel(item.importance, item.complexity)}
            </div>
            <div className="tooltip-dates">
              {item.start_time.format('DD.MM.YYYY')} - {item.end_time.format('DD.MM.YYYY')}
            </div>
            {item.tags && item.tags.length > 0 && (
              <div className="tooltip-tags">
                Теги: {item.tags.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CustomTimelineItem;