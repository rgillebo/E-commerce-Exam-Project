const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Role = require("./role");
const Membership = require("./membership");

class User extends Model {}

User.init(
  {
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: DataTypes.STRING,
    telephonenumber: DataTypes.STRING,
    membership_status: {
      type: DataTypes.STRING,
      references: {
        model: Membership,
        key: "status",
      },
      allowNull: false,
      defaultValue: "Bronze",
    },
    role_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Role,
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    timestamps: true,
  }
);

User.associate = function (models) {
  User.belongsTo(models.Role, { foreignKey: "role_id" });
  User.belongsTo(models.Membership, {
    foreignKey: "membership_status",
    targetKey: "status",
  });
  User.hasMany(models.Order, { foreignKey: "user_id" });
  User.hasOne(models.Cart, { foreignKey: "user_id" });
};

module.exports = User;
