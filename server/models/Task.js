const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Board = require('./Board');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  boardId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Board,
      key: 'id'
    },
    field: 'board_id'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  importance: {
    type: DataTypes.ENUM('high', 'medium', 'low'),
    allowNull: false
  },
  complexity: {
    type: DataTypes.ENUM('high', 'medium', 'low'),
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_date'
  },
  tags: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'tasks',
  timestamps: true,
  underscored: true
});

Task.belongsTo(Board, { foreignKey: 'board_id' });
Board.hasMany(Task, { foreignKey: 'board_id' });

module.exports = Task;