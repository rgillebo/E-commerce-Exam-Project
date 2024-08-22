const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Cart extends Model {}

Cart.init(
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
    checked_out: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Cart",
    timestamps: true,
  }
);

Cart.associate = function (models) {
  Cart.belongsTo(models.User, { foreignKey: "user_id" });
  Cart.hasMany(models.CartItem, { foreignKey: "cart_id" });
};

module.exports = Cart;
