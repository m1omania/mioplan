import React from 'react';

const TimelineExporter = ({ tasks, onExport }) => {
  const handleExportPNG = () => {
    // В реальной реализации здесь будет код для экспорта в PNG
    alert('Функция экспорта в PNG будет реализована в следующей версии');
    // TODO: Реализовать экспорт в PNG
  };

  const handleExportPDF = () => {
    // В реальной реализации здесь будет код для экспорта в PDF
    alert('Функция экспорта в PDF будет реализована в следующей версии');
    // TODO: Реализовать экспорт в PDF
  };

  return (
    <div className="timeline-exporter">
      <h3>Экспорт таймлайна</h3>
      <div className="export-buttons">
        <button onClick={handleExportPNG} className="export-button png-export">
          Экспорт в PNG
        </button>
        <button onClick={handleExportPDF} className="export-button pdf-export">
          Экспорт в PDF
        </button>
      </div>
    </div>
  );
};

export default TimelineExporter;