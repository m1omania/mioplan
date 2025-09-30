import React from 'react';
import './ViewToggle.css';

const ViewToggle = ({ view, onViewChange }) => {
  return (
    <div className="view-toggle">
      <button 
        className={`toggle-button ${view === 'matrix' ? 'active' : ''}`}
        onClick={() => onViewChange('matrix')}
      >
        Матрица
      </button>
      <button 
        className={`toggle-button ${view === 'timeline' ? 'active' : ''}`}
        onClick={() => onViewChange('timeline')}
      >
        Таймлайн
      </button>
    </div>
  );
};

export default ViewToggle;