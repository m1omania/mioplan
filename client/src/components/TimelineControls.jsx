import React, { useState } from 'react';
import TimelineExporter from './TimelineExporter';

const TimelineControls = ({ 
  searchTerm, 
  onSearchChange,
  filters,
  onFiltersChange,
  onExport
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showExporter, setShowExporter] = useState(false);

  const handleSectorFilterChange = (sectorId) => {
    const newFilters = { ...filters };
    if (newFilters.sectors.includes(sectorId)) {
      newFilters.sectors = newFilters.sectors.filter(id => id !== sectorId);
    } else {
      newFilters.sectors.push(sectorId);
    }
    onFiltersChange(newFilters);
  };

  const sectorOptions = [
    { id: 'high-high', label: 'Важно / Сложно' },
    { id: 'high-medium', label: 'Важно / Средне' },
    { id: 'high-low', label: 'Важно / Просто' },
    { id: 'medium-high', label: 'Средне / Сложно' },
    { id: 'medium-medium', label: 'Средне / Средне' },
    { id: 'medium-low', label: 'Средне / Просто' },
    { id: 'low-high', label: 'Минимум / Сложно' },
    { id: 'low-medium', label: 'Минимум / Средне' },
    { id: 'low-low', label: 'Минимум / Просто' }
  ];

  return (
    <div className="timeline-controls">
      <div className="timeline-controls-row">
        <div className="search-container">
          <input
            type="text"
            placeholder="Поиск задач..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="controls-buttons">
          <button 
            className="filter-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            Фильтры {showFilters ? '▲' : '▼'}
          </button>
          <button 
            className="export-button"
            onClick={() => setShowExporter(!showExporter)}
          >
            Экспорт {showExporter ? '▲' : '▼'}
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <h4>Секторы:</h4>
            <div className="sector-filters">
              {sectorOptions.map(sector => (
                <label key={sector.id} className="sector-filter">
                  <input
                    type="checkbox"
                    checked={filters.sectors.includes(sector.id)}
                    onChange={() => handleSectorFilterChange(sector.id)}
                  />
                  <span className="sector-label">{sector.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {showExporter && (
        <TimelineExporter onExport={onExport} />
      )}
    </div>
  );
};

export default TimelineControls;