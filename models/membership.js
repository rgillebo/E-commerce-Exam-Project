const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");

class Membership extends Model {}

Membership.init(
  {
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    min_items: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    max_items: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    discount_percentage: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "Membership",
    timestamps: true,
  }
);

Membership.associate = function (models) {
  Membership.hasMany(models.User, { foreignKey: "membership_status" });
};

// Hook to prevent deletion if assigned to a user
Membership.beforeDestroy(async (membership, options) => {
  const userCount = await User.count({
    where: { membership_status: membership.status },
  });
  if (userCount > 0) {
    throw new Error("Cannot delete membership that is assigned to a user");
  }
});

module.exports = Membership;
