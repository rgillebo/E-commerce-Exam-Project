const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Role extends Model {}

Role.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "Role",
    timestamps: true,
  }
);

module.exports = Role;
