const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Product extends Model {}

Product.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Categories",
        key: "id",
      },
    },
    brand_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Brands",
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Product",
    timestamps: true,
  }
);

Product.associate = function (models) {
  Product.belongsTo(models.Category, { foreignKey: "category_id" });
  Product.belongsTo(models.Brand, { foreignKey: "brand_id" });
  Product.belongsToMany(models.Cart, {
    through: models.CartItem,
    foreignKey: "product_id",
  });
  Product.belongsToMany(models.Order, {
    through: models.OrderItem,
    foreignKey: "product_id",
  });
};

module.exports = Product;
