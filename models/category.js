const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Category extends Model {}

Category.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Category",
    timestamps: true,
  }
);

Category.associate = function (models) {
  Category.hasMany(models.Product, { foreignKey: "category_id" });
};

module.exports = Category;
