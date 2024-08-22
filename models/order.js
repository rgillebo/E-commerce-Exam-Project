const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Order extends Model {}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "In Progress",
      allowNull: false,
    },
    order_number: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    discount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "Order",
    timestamps: true,
  }
);

Order.associate = function (models) {
  Order.belongsTo(models.User, { foreignKey: "user_id" });
  Order.hasMany(models.OrderItem, { foreignKey: "order_id" });
};

module.exports = Order;
