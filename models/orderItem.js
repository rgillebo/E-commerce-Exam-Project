const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class OrderItem extends Model {}

OrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "orders",
        key: "id",
      },
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "products",
        key: "id",
      },
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "OrderItem",
    timestamps: true,
  }
);

OrderItem.associate = function (models) {
  OrderItem.belongsTo(models.Order, { foreignKey: "order_id" });
  OrderItem.belongsTo(models.Product, { foreignKey: "product_id" });
};

module.exports = OrderItem;
