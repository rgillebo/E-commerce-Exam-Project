require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const methodOverride = require("method-override");

// Import Sequelize and models
const sequelize = require("./config/database");
const models = require("./models");

// Import routers
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const utilityRouter = require("./routes/utility");
const productsRouter = require("./routes/products");
const categoriesRouter = require("./routes/categories");
const brandsRouter = require("./routes/brands");
const cartRouter = require("./routes/cart");
const ordersRouter = require("./routes/orders");
const adminRouter = require("./routes/admin");
const searchRouter = require("./routes/search");
const membershipRouter = require("./routes/membership");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware setup
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

// Swagger setup
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Route setup
app.use("/", indexRouter);
app.use("/auth", usersRouter);
app.use("/utility", utilityRouter);
app.use("/products", productsRouter);
app.use("/categories", categoriesRouter);
app.use("/brands", brandsRouter);
app.use("/cart", cartRouter);
app.use("/orders", ordersRouter);
app.use("/admin", adminRouter);
app.use("/search", searchRouter);
app.use("/membership", membershipRouter);

// Sync database
sequelize
  .sync()
  .then(() => {
    console.log("Database synced");
  })
  .catch((err) => {
    console.error("Unable to sync database:", err);
  });

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
