'use strict';

module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoGenerated: true, 
    } ,
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,   
    },
    title: {
      type:DataTypes.STRING,
      allowNull: false,   
    },
    description: {
      type:DataTypes.TEXT,
      allowNull: false,
    },
    estimatetime: {
      type:DataTypes.STRING,
      allowNull: true,
    },
    materialsNeeded: {
      type:DataTypes.STRING,
      allowNull: true,
    }
  }, {});
  Course.associate = function(models) {
    // define associations
    Course.belongsTo(models.User, {
      foreignKey: {
        fieldName: 'directorUserId',
        allowNull: false,
      },
    }, { sequelize }); 
  };
  return Course;
};