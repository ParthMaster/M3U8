const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("next-db", "postgres", "postgres", {
  host: "localhost",
  dialect: "postgres",
  // other configurations...
});

const Video = sequelize.define("Video", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = { sequelize, Video };
