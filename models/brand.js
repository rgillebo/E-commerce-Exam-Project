const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Brand extends Model {}

Brand.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Brand",
    timestamps: true,
  }
);

Brand.associate = function (models) {
  Brand.hasMany(models.Product, { foreignKey: "brand_id" });
};

module.exports = Brand;
