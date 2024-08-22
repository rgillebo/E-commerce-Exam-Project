const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Noroff EP1 E-commerce API Documentation",
    description: "API documentation for the project",
  },
  host: "localhost:3000",
  schemes: ["http"],
  securityDefinitions: {
    BearerAuth: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description: "Enter JWT token in the format: Bearer <token>",
    },
  },
  tags: [
    {
      name: "Guest",
      description: "Guest operations",
    },
    {
      name: "User",
      description: "User operations",
    },
    {
      name: "Admin",
      description: "Admin operations",
    },
  ],
  definitions: {
    Product: {
      name: "Sample Product",
      description: "Product description",
      price: 100.0,
      category_id: 1,
      brand_id: 1,
      quantity: 10,
      is_deleted: false,
    },
    Category: {
      name: "Sample Category",
    },
    Brand: {
      name: "Sample Brand",
    },
    Membership: {
      name: "Sample Membership",
    },
    Role: {
      id: "1",
      name: "Admin",
    },
    User: {
      firstname: "Test",
      lastname: "User",
      username: "testuser",
      email: "testuser@example.com",
      password: "securepassword",
      address: "Stormwind 123",
      telephonenumber: "911",
    },
    Utility: {
      name: "Sample Utility",
    },
    Search: {
      query: "apple",
      filter: "name",
    },
    Cart: {
      product_id: 1,
      quantity: 2,
    },
    Order: {
      status: "In progress",
      order_number: "abcdefgh",
      discount: 0,
    },
  },
};

const outputFile = "./swagger_output.json";
const endpointsFiles = [
  "./routes/admin.js",
  "./middleware/auth.js",
  "./routes/products.js",
  "./routes/categories.js",
  "./routes/brands.js",
  "./routes/membership.js",
  "./routes/users.js",
  "./routes/utility.js",
  "./routes/search.js",
  "./routes/cart.js",
  "./routes/orders.js",
];

swaggerAutogen(outputFile, endpointsFiles, doc);
