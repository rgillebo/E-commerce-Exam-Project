const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class CartItem extends Model {}

CartItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cart_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "carts",
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
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "CartItem",
    timestamps: true,
    paranoid: true, // Enables the 'deleted_at' field for soft deletes
  }
);

CartItem.associate = function (models) {
  CartItem.belongsTo(models.Cart, { foreignKey: "cart_id" });
  CartItem.belongsTo(models.Product, { foreignKey: "product_id" });
};

module.exports = CartItem;
