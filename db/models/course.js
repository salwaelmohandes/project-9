'use strict';

const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}
  Course.init({   
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,   
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,   
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    estimatedTime: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    materialsNeeded: {
      type: Sequelize.STRING,
      allowNull: true,
    }
  }, { sequelize });

  Course.associate = (models) => {
    // define associations
    Course.belongsTo(models.User, {
      as: 'user', //alias
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      },
    }); 
  };
  return Course;
};