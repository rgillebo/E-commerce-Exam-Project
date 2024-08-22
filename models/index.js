"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const User = require("./user");
const Product = require("./product");
const Category = require("./category");
const Brand = require("./brand");
const Cart = require("./cart");
const CartItem = require("./cartItem");
const Order = require("./order");
const OrderItem = require("./orderItem");
const Membership = require("./membership");
const Role = require("./role");

const models = {
  User,
  Product,
  Category,
  Brand,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Membership,
  Role,
};

// Define associations
User.associate = function (models) {
  User.belongsTo(models.Role, { foreignKey: "role_id" });
  User.belongsTo(models.Membership, { foreignKey: "membership_status" });
  User.hasMany(models.Order, { foreignKey: "user_id" });
  User.hasOne(models.Cart, { foreignKey: "user_id" });
};

Product.associate = function (models) {
  Product.belongsTo(models.Category, { foreignKey: "category_id" });
  Product.belongsTo(models.Brand, { foreignKey: "brand_id" });
  Product.hasMany(models.CartItem, { foreignKey: "product_id" });
  Product.hasMany(models.OrderItem, { foreignKey: "product_id" });
};

Category.associate = function (models) {
  Category.hasMany(models.Product, { foreignKey: "category_id" });
};

Brand.associate = function (models) {
  Brand.hasMany(models.Product, { foreignKey: "brand_id" });
};

Cart.associate = function (models) {
  Cart.belongsTo(models.User, { foreignKey: "user_id" });
  Cart.hasMany(models.CartItem, { foreignKey: "cart_id" });
};

CartItem.associate = function (models) {
  CartItem.belongsTo(models.Cart, { foreignKey: "cart_id" });
  CartItem.belongsTo(models.Product, { foreignKey: "product_id" });
};

Order.associate = function (models) {
  Order.belongsTo(models.User, { foreignKey: "user_id" });
  Order.hasMany(models.OrderItem, { foreignKey: "order_id" });
};

OrderItem.associate = function (models) {
  OrderItem.belongsTo(models.Order, { foreignKey: "order_id" });
  OrderItem.belongsTo(models.Product, { foreignKey: "product_id" });
};

Membership.associate = function (models) {
  Membership.hasMany(models.User, { foreignKey: "membership_status" });
};

// Call associate method on each model to set up associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Sync database
sequelize
  .sync()
  .then(() => {
    console.log("Database & tables created!");
  })
  .catch((err) => {
    console.error("Unable to sync database:", err);
  });

module.exports = models;
