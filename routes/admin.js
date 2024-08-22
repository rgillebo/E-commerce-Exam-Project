const express = require("express");
const { Product, Brand, Category, User, Order, Role } = require("../models");
const { authenticate, authorize } = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const router = express.Router();

// Admin login view
router.get("/login", (req, res) => {
  /* #swagger.tags = ['Admin']
     #swagger.path = '/admin/login'
     #swagger.description = 'Endpoint to render the admin login page'
     #swagger.responses[200] = {
         description: 'Login page rendered successfully',
         schema: {
             success: true,
             message: 'Login page rendered successfully'
         }
     }
  */
  res.render("layout", {
    title: "Admin Login",
    content: "admin/login",
    loggedIn: false,
  });
});

// Admin login
router.post("/login", async (req, res) => {
  /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/login'
     #swagger.description = 'Endpoint for admin login'
     #swagger.parameters['obj'] = {
         in: 'body',
         description: 'Admin login credentials',
         required: true,
         schema: {
             username: 'admin',
             password: 'P@ssword2023'
         }
     }
     #swagger.responses[200] = {
         description: 'Successful login',
         schema: {
             success: true,
             message: 'Login successful. Redirecting to products page...',
             token:  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
         }
     }
     #swagger.responses[401] = {
         description: 'Invalid credentials',
         schema: {
             success: false,
             message: 'Invalid credentials'
         }
     }
  */
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    if (user.role_id !== 1) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: "Admin" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.cookie("token", token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });
    res.json({
      success: true,
      message: "Login successful. Redirecting to products page...",
      token: token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});

// Admin logout
router.get("/logout", (req, res) => {
  /* #swagger.tags = ['Admin']
     #swagger.path = '/admin/logout'
     #swagger.description = 'Endpoint for admin logout'
     #swagger.responses[200] = {
         description: 'Successful logout',
         schema: {
             success: true,
             message: 'Logout successful. Redirecting to login page...'
         }
     }
  */
  res.clearCookie("token");
  res.redirect("/admin/login");
});

// Admin dashboard
router.get("/", authenticate, authorize("Admin"), (req, res) => {
  /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/'
     #swagger.description = 'Endpoint to render the admin dashboard page'
     #swagger.responses[200] = {
         description: 'Admin dashboard rendered successfully',
         schema: {
             success: true,
             message: 'Admin dashboard rendered successfully'
         }
     }
  */
  res.render("layout", {
    title: "Admin Dashboard",
    content: "admin/dashboard",
    loggedIn: true,
  });
});

// Manage Products
router.get("/products", authenticate, authorize("Admin"), async (req, res) => {
  /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/products'
     #swagger.description = 'Endpoint to get all products'
     #swagger.responses[200] = {
         description: 'Products retrieved successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Products retrieved successfully',
                 products: [{ $ref: '#/definitions/Product' }]
             }
         }
     }
  */
  try {
    const products = await Product.findAll({ include: [Category, Brand] });
    const categories = await Category.findAll();
    const brands = await Brand.findAll();

    // Check the 'Accept' header to determine the response format
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(200).json({
        status: "success",
        statuscode: 200,
        data: {
          result: "Products retrieved successfully",
          products,
          categories,
          brands,
        },
      });
    }

    res.render("layout", {
      title: "Manage Products",
      content: "admin/products",
      products,
      categories,
      brands,
      loggedIn: true,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
      },
    });
  }
});

// Get Products by ID
router.get(
  "/products/:id",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/products/{id}'
     #swagger.description = 'Endpoint to get product by ID'
     #swagger.parameters['id'] = {
         in: 'path',
         description: 'Product ID',
         required: true,
         type: 'integer'
     }
     #swagger.responses[200] = {
         description: 'Product retrieved successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Product retrieved successfully',
                 product: { $ref: '#/definitions/Product' }
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Product not found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'Product not found'
             }
         }
     }
  */
    try {
      const product = await Product.findByPk(req.params.id, {
        include: [Category, Brand],
      });
      if (!product || product.is_deleted) {
        return res.status(404).json({
          status: "error",
          statuscode: 404,
          data: {
            result: "Product not found",
          },
        });
      }
      res.json({
        status: "success",
        statuscode: 200,
        data: {
          result: "Product retrieved successfully",
          product,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        statuscode: 500,
        data: {
          result: error.message,
        },
      });
    }
  }
);

// Add New Products
router.post("/products", authenticate, authorize("Admin"), async (req, res) => {
  /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/products'
     #swagger.description = 'Endpoint to add a new product'
     #swagger.parameters['obj'] = {
         in: 'body',
         description: 'Product data',
         required: true,
         schema: { $ref: '#/definitions/Product' }
     }
     #swagger.responses[200] = {
         description: 'Product created successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Product created successfully',
                 product: { $ref: '#/definitions/Product' }
             }
         }
     }
  */
  try {
    const { name, description, price, quantity, category_id, brand_id } =
      req.body;
    const product = await Product.create({
      name,
      description,
      price,
      quantity,
      category_id,
      brand_id,
    });
    res.json({
      status: "success",
      statuscode: 200,
      data: {
        result: "Product created successfully",
        product,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
      },
    });
  }
});

// Update Products by ID
router.put(
  "/products/:id",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/products/{id}'
     #swagger.description = 'Endpoint to update product by ID'
     #swagger.parameters['id'] = {
         in: 'path',
         description: 'Product ID',
         required: true,
         type: 'integer'
     }
     #swagger.parameters['obj'] = {
         in: 'body',
         description: 'Updated product data',
         required: true,
         schema: { $ref: '#/definitions/Product' }
     }
     #swagger.responses[200] = {
         description: 'Product updated successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Product updated successfully'
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Product not found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'Product not found'
             }
         }
     }
  */
    try {
      const { id } = req.params;
      const { name, description, price, quantity, category_id, brand_id } =
        req.body;
      const product = await Product.findByPk(id);
      if (!product || product.is_deleted) {
        return res.status(404).json({
          status: "error",
          statuscode: 404,
          data: {
            result: "Product not found",
          },
        });
      }
      await product.update({
        name,
        description,
        price,
        quantity,
        category_id,
        brand_id,
      });
      res.json({
        status: "success",
        statuscode: 200,
        data: {
          result: "Product updated successfully",
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        statuscode: 500,
        data: {
          result: error.message,
        },
      });
    }
  }
);

// Soft delete product
router.delete(
  "/products/:id",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/products/{id}'
     #swagger.description = 'Endpoint to delete product by ID'
     #swagger.parameters['id'] = {
         in: 'path',
         description: 'Product ID',
         required: true,
         type: 'integer'
     }
     #swagger.responses[200] = {
         description: 'Product deleted successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Product deleted successfully'
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Product not found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'Product not found'
             }
         }
     }
  */
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product || product.is_deleted === true) {
        return res.status(404).json({
          status: "error",
          statuscode: 404,
          data: {
            result: "Product not found",
          },
        });
      }
      await product.update({ is_deleted: true });
      res.json({
        status: "success",
        statuscode: 200,
        data: {
          result: "Product deleted successfully",
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        statuscode: 500,
        data: {
          result: error.message,
        },
      });
    }
  }
);

// Soft undelete product
router.put(
  "/products/:id/status",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/products/{id}/status'
     #swagger.description = 'Endpoint to update product status by ID'
     #swagger.parameters['id'] = {
         in: 'path',
         description: 'Product ID',
         required: true,
         type: 'integer'
     }
     #swagger.parameters['obj'] = {
         in: 'body',
         description: 'Product status data',
         required: true,
         schema: { is_deleted: false }
     }
     #swagger.responses[200] = {
         description: 'Product status updated successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Product status updated successfully'
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Product not found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'Product not found'
             }
         }
     }
  */
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return res.status(404).json({
          status: "error",
          statuscode: 404,
          data: {
            result: "Product not found",
          },
        });
      }
      await product.update({ is_deleted: req.body.is_deleted });
      res.json({
        status: "success",
        statuscode: 200,
        data: {
          result: "Product status updated successfully",
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        statuscode: 500,
        data: {
          result: error.message,
        },
      });
    }
  }
);

// Manage Brands
router.get("/brands", authenticate, authorize("Admin"), async (req, res) => {
  /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/brands'
     #swagger.description = 'Endpoint to get all brands'
     #swagger.responses[200] = {
         description: 'Brands retrieved successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Brands retrieved successfully',
                 brands: [{ $ref: '#/definitions/Brand' }]
             }
         }
     }
  */
  try {
    const brands = await Brand.findAll();

    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(200).json({
        status: "success",
        statuscode: 200,
        data: {
          result: "Brands retrieved successfully",
          brands,
        },
      });
    }

    res.render("layout", {
      title: "Manage Brands",
      content: "admin/brands",
      brands,
      loggedIn: true,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
      },
    });
  }
});

// Get Brands by ID
router.get(
  "/brands/:id",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/brands/{id}'
     #swagger.description = 'Endpoint to get brand by ID'
     #swagger.parameters['id'] = {
         in: 'path',
         description: 'Brand ID',
         required: true,
         type: 'integer'
     }
     #swagger.responses[200] = {
         description: 'Brand retrieved successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Brand retrieved successfully',
                 brand: { $ref: '#/definitions/Brand' }
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Brand not found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'Brand not found'
             }
         }
     }
  */
    try {
      const brand = await Brand.findByPk(req.params.id);
      if (!brand) {
        return res.status(404).json({
          status: "error",
          statuscode: 404,
          data: {
            result: "Brand not found",
          },
        });
      }
      res.json({
        status: "success",
        statuscode: 200,
        data: {
          result: "Brand retrieved successfully",
          brand,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        statuscode: 500,
        data: {
          result: error.message,
        },
      });
    }
  }
);

// Add New Brands
router.post("/brands", authenticate, authorize("Admin"), async (req, res) => {
  /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/brands'
     #swagger.description = 'Endpoint to add a new brand'
     #swagger.parameters['obj'] = {
         in: 'body',
         description: 'Brand data',
         required: true,
         schema: { $ref: '#/definitions/Brand' }
     }
     #swagger.responses[200] = {
         description: 'Brand created successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Brand created successfully',
                 brand: { $ref: '#/definitions/Brand' }
             }
         }
     }
  */
  try {
    const { name } = req.body;
    const brand = await Brand.create({ name });
    res.json({
      status: "success",
      statuscode: 200,
      data: {
        result: "Brand created successfully",
        brand,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
      },
    });
  }
});

// Update Brands by ID
router.put(
  "/brands/:id",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/brands/{id}'
     #swagger.description = 'Endpoint to update brand by ID'
     #swagger.parameters['id'] = {
         in: 'path',
         description: 'Brand ID',
         required: true,
         type: 'integer'
     }
     #swagger.parameters['obj'] = {
         in: 'body',
         description: 'Updated brand data',
         required: true,
         schema: { $ref: '#/definitions/Brand' }
     }
     #swagger.responses[200] = {
         description: 'Brand updated successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Brand updated successfully'
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Brand not found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'Brand not found'
             }
         }
     }
  */
    try {
      const { name } = req.body;
      const brand = await Brand.findByPk(req.params.id);
      if (!brand) {
        return res.status(404).json({
          status: "error",
          statuscode: 404,
          data: {
            result: "Brand not found",
          },
        });
      }
      await brand.update({ name });
      res.json({
        status: "success",
        statuscode: 200,
        data: {
          result: "Brand updated successfully",
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        statuscode: 500,
        data: {
          result: error.message,
        },
      });
    }
  }
);

// Delete Brand
router.delete(
  "/brands/:id",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/brands/{id}'
     #swagger.description = 'Endpoint to delete brand by ID'
     #swagger.parameters['id'] = {
         in: 'path',
         description: 'Brand ID',
         required: true,
         type: 'integer'
     }
     #swagger.responses[200] = {
         description: 'Brand deleted successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Brand deleted successfully'
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Brand not found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'Brand not found'
             }
         }
     }
  */
    try {
      const brand = await Brand.findByPk(req.params.id);
      if (!brand) {
        return res.status(404).json({
          status: "error",
          statuscode: 404,
          data: {
            result: "Brand not found",
          },
        });
      }
      await brand.destroy();
      res.json({
        status: "success",
        statuscode: 200,
        data: {
          result: "Brand deleted successfully",
        },
      });
    } catch (error) {
      if (error.name === "SequelizeForeignKeyConstraintError") {
        res.status(400).json({
          status: "error",
          statuscode: 400,
          data: {
            result:
              "Cannot delete brand as it is associated with one or more products",
          },
        });
      } else {
        res.status(500).json({
          status: "error",
          statuscode: 500,
          data: {
            result: error.message,
          },
        });
      }
    }
  }
);

// Manage Categories
router.get(
  "/categories",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/categories'
     #swagger.description = 'Endpoint to get all categories'
     #swagger.responses[200] = {
         description: 'Categories retrieved successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Categories retrieved successfully',
                 categories: [{ $ref: '#/definitions/Category' }]
             }
         }
     }
  */
    try {
      const categories = await Category.findAll();

      if (
        req.headers.accept &&
        req.headers.accept.includes("application/json")
      ) {
        return res.status(200).json({
          status: "success",
          statuscode: 200,
          data: {
            result: "Categories retrieved successfully",
            categories,
          },
        });
      }

      res.render("layout", {
        title: "Manage Categories",
        content: "admin/categories",
        categories,
        loggedIn: true,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        statuscode: 500,
        data: {
          result: error.message,
        },
      });
    }
  }
);

// Get Categories by ID
router.get(
  "/categories/:id",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/categories/{id}'
     #swagger.description = 'Endpoint to get category by ID'
     #swagger.parameters['id'] = {
         in: 'path',
         description: 'Category ID',
         required: true,
         type: 'integer'
     }
     #swagger.responses[200] = {
         description: 'Category retrieved successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Category retrieved successfully',
                 category: { $ref: '#/definitions/Category' }
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Category not found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'Category not found'
             }
         }
     }
  */
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category) {
        return res.status(404).json({
          status: "error",
          statuscode: 404,
          data: {
            result: "Category not found",
          },
        });
      }
      res.json({
        status: "success",
        statuscode: 200,
        data: {
          result: "Category retrieved successfully",
          category,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        statuscode: 500,
        data: {
          result: error.message,
        },
      });
    }
  }
);

// Add New Categories
router.post(
  "/categories",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/categories'
     #swagger.description = 'Endpoint to add a new category'
     #swagger.parameters['obj'] = {
         in: 'body',
         description: 'Category data',
         required: true,
         schema: { $ref: '#/definitions/Category' }
     }
     #swagger.responses[200] = {
         description: 'Category created successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Category created successfully',
                 category: { $ref: '#/definitions/Category' }
             }
         }
     }
  */
    try {
      const { name } = req.body;
      const category = await Category.create({ name });
      res.json({
        status: "success",
        statuscode: 200,
        data: {
          result: "Category created successfully",
          category,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        statuscode: 500,
        data: {
          result: error.message,
        },
      });
    }
  }
);

// Update Categories by ID
router.put(
  "/categories/:id",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/categories/{id}'
     #swagger.description = 'Endpoint to update category by ID'
     #swagger.parameters['id'] = {
         in: 'path',
         description: 'Category ID',
         required: true,
         type: 'integer'
     }
     #swagger.parameters['obj'] = {
         in: 'body',
         description: 'Updated category data',
         required: true,
         schema: { $ref: '#/definitions/Category' }
     }
     #swagger.responses[200] = {
         description: 'Category updated successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Category updated successfully'
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Category not found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'Category not found'
             }
         }
     }
  */
    try {
      const { name } = req.body;
      const category = await Category.findByPk(req.params.id);
      if (!category) {
        return res.status(404).json({
          status: "error",
          statuscode: 404,
          data: {
            result: "Category not found",
          },
        });
      }
      await category.update({ name });
      res.json({
        status: "success",
        statuscode: 200,
        data: {
          result: "Category updated successfully",
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        statuscode: 500,
        data: {
          result: error.message,
        },
      });
    }
  }
);

// Delete Category
router.delete(
  "/categories/:id",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/categories/{id}'
     #swagger.description = 'Endpoint to delete category by ID'
     #swagger.parameters['id'] = {
         in: 'path',
         description: 'Category ID',
         required: true,
         type: 'integer'
     }
     #swagger.responses[200] = {
         description: 'Category deleted successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Category deleted successfully'
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Category not found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'Category not found'
             }
         }
     }
  */
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category) {
        return res.status(404).json({
          status: "error",
          statuscode: 404,
          data: {
            result: "Category not found",
          },
        });
      }
      await category.destroy();
      res.json({
        status: "success",
        statuscode: 200,
        data: {
          result: "Category deleted successfully",
        },
      });
    } catch (error) {
      if (error.name === "SequelizeForeignKeyConstraintError") {
        res.status(400).json({
          status: "error",
          statuscode: 400,
          data: {
            result:
              "Cannot delete category as it is associated with one or more products",
          },
        });
      } else {
        res.status(500).json({
          status: "error",
          statuscode: 500,
          data: {
            result: error.message,
          },
        });
      }
    }
  }
);

// Manage Roles
router.get("/roles", authenticate, authorize("Admin"), async (req, res) => {
  /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/roles'
     #swagger.description = 'Endpoint to get all roles'
     #swagger.responses[200] = {
         description: 'Roles retrieved successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Roles retrieved successfully',
                 roles: [{ $ref: '#/definitions/Role' }]
             }
         }
     }
  */
  try {
    const roles = await Role.findAll();

    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(200).json({
        status: "success",
        statuscode: 200,
        data: {
          result: "Roles retrieved successfully",
          roles,
        },
      });
    }
    res.render("layout", {
      title: "View Roles",
      content: "admin/roles",
      roles,
      loggedIn: true,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
      },
    });
  }
});

// Manage Users
router.get("/users", authenticate, authorize("Admin"), async (req, res) => {
  /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/users'
     #swagger.description = 'Endpoint to get all users'
     #swagger.responses[200] = {
         description: 'Users retrieved successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Users retrieved successfully',
                 users: [{ $ref: '#/definitions/User' }]
             }
         }
     }
  */
  try {
    const users = await User.findAll({ include: Role });
    const roles = await Role.findAll(); // Fetch all roles

    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(200).json({
        status: "success",
        statuscode: 200,
        data: {
          result: "Users retrieved successfully",
          users,
        },
      });
    }

    res.render("layout", {
      title: "Manage Users",
      content: "admin/users",
      users,
      roles,
      loggedIn: true,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
      },
    });
  }
});

// Get Users by ID
router.get("/users/:id", authenticate, authorize("Admin"), async (req, res) => {
  /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/users/{id}'
     #swagger.description = 'Endpoint to get user by ID'
     #swagger.parameters['id'] = {
         in: 'path',
         description: 'User ID',
         required: true,
         type: 'integer'
     }
     #swagger.responses[200] = {
         description: 'User retrieved successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'User retrieved successfully',
                 user: { $ref: '#/definitions/User' }
             }
         }
     }
     #swagger.responses[404] = {
         description: 'User not found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'User not found'
             }
         }
     }
  */
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        statuscode: 404,
        data: {
          result: "User not found",
        },
      });
    }
    res.json({
      status: "success",
      statuscode: 200,
      data: {
        result: "User retrieved successfully",
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
      },
    });
  }
});

// Update Users by ID
router.put("/users/:id", authenticate, authorize("Admin"), async (req, res) => {
  /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/users/{id}'
     #swagger.description = 'Endpoint to update user by ID'
     #swagger.parameters['id'] = {
         in: 'path',
         description: 'User ID',
         required: true,
         type: 'integer'
     }
     #swagger.parameters['obj'] = {
         in: 'body',
         description: 'Updated user data',
         required: true,
         schema: { $ref: '#/definitions/User' }
     }
     #swagger.responses[200] = {
         description: 'User updated successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'User updated successfully'
             }
         }
     }
     #swagger.responses[404] = {
         description: 'User not found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'User not found'
             }
         }
     }
  */
  try {
    const {
      username,
      email,
      firstname,
      lastname,
      role_id,
      membership_status,
      address,
      telephonenumber,
    } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        statuscode: 404,
        data: {
          result: "User not found",
        },
      });
    }
    await user.update({
      username,
      email,
      firstname,
      lastname,
      role_id,
      membership_status,
      address,
      telephonenumber,
    });
    res.json({
      status: "success",
      statuscode: 200,
      data: {
        result: "User updated successfully",
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
      },
    });
  }
});

// Manage Orders
router.get("/orders", authenticate, authorize("Admin"), async (req, res) => {
  /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/orders'
     #swagger.description = 'Endpoint to get all orders'
     #swagger.responses[200] = {
         description: 'Orders retrieved successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Orders retrieved successfully',
                 orders: [{ $ref: '#/definitions/Order' }]
             }
         }
     }
  */
  try {
    const orders = await Order.findAll({ include: User });
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.json({
        status: "success",
        statuscode: 200,
        data: {
          result: "Orders retrieved successfully",
          orders,
        },
      });
    } else {
      res.render("layout", {
        title: "Manage Orders",
        content: "admin/orders",
        orders,
        loggedIn: true,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
      },
    });
  }
});

// Get Orders by ID
router.get(
  "/orders/:id",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/orders/{id}'
     #swagger.description = 'Endpoint to get order by ID'
     #swagger.parameters['id'] = {
         in: 'path',
         description: 'Order ID',
         required: true,
         type: 'integer'
     }
     #swagger.responses[200] = {
         description: 'Order retrieved successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Order retrieved successfully',
                 order: { $ref: '#/definitions/Order' }
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Order not found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'Order not found'
             }
         }
     }
  */
    try {
      const order = await Order.findByPk(req.params.id, { include: User });
      if (!order) {
        return res.status(404).json({
          status: "error",
          statuscode: 404,
          data: {
            result: "Order not found",
          },
        });
      }
      res.json({
        status: "success",
        statuscode: 200,
        data: {
          result: "Order retrieved successfully",
          order,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        statuscode: 500,
        data: {
          result: error.message,
        },
      });
    }
  }
);

// Update Orders by ID
router.put(
  "/orders/:id/status",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/orders/{id}/status'
     #swagger.description = 'Endpoint to update order status by ID'
     #swagger.parameters['id'] = {
         in: 'path',
         description: 'Order ID',
         required: true,
         type: 'integer'
     }
     #swagger.parameters['obj'] = {
         in: 'body',
         description: 'Order status data',
         required: true,
         schema: { status: 'string' }
     }
     #swagger.responses[200] = {
         description: 'Order status updated successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Order status updated successfully'
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Order not found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'Order not found'
             }
         }
     }
  */
    try {
      const { status } = req.body;
      const order = await Order.findByPk(req.params.id);
      if (!order) {
        return res.status(404).json({
          status: "error",
          statuscode: 404,
          data: {
            result: "Order not found",
          },
        });
      }
      await order.update({ status });
      res.json({
        status: "success",
        statuscode: 200,
        data: {
          result: "Order status updated successfully",
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        statuscode: 500,
        data: {
          result: error.message,
        },
      });
    }
  }
);

// Search products by name, category, or brand
router.post("/products/search", async (req, res) => {
  /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/products/search'
     #swagger.description = 'Endpoint to search products by name, category, or brand'
     #swagger.parameters['obj'] = {
         in: 'body',
         description: 'Search query and filter',
         required: true,
         schema: {
             query: 'string',
             filter: 'string'
         }
     }
     #swagger.responses[200] = {
         description: 'Products retrieved successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Products retrieved successfully',
                 items: [{ $ref: '#/definitions/Product' }],
                 count: 'integer'
             }
         }
     }
  */
  try {
    const { query, filter } = req.body;
    let products;

    if (filter === "category") {
      products = await Product.findAll({
        include: [
          {
            model: Category,
            where: {
              name: {
                [Op.like]: `%${query}%`,
              },
            },
          },
          Brand,
        ],
      });
    } else if (filter === "brand") {
      products = await Product.findAll({
        include: [
          {
            model: Brand,
            where: {
              name: {
                [Op.like]: `%${query}%`,
              },
            },
          },
          Category,
        ],
      });
    } else {
      products = await Product.findAll({
        where: {
          name: {
            [Op.like]: `%${query}%`,
          },
        },
        include: [Category, Brand],
      });
    }

    res.json({
      status: "success",
      statuscode: 200,
      data: {
        result: "Products retrieved successfully",
        items: products,
        count: products.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
      },
    });
  }
});

// Search orders by user and status
router.post("/orders/search", async (req, res) => {
  /* #swagger.tags = ['Admin']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/admin/orders/search'
     #swagger.description = 'Endpoint to search orders by user and status'
     #swagger.parameters['obj'] = {
         in: 'body',
         description: 'Search query and filter',
         required: true,
         schema: {
             query: 'string',
             filter: 'string'
         }
     }
     #swagger.responses[200] = {
         description: 'Orders retrieved successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Orders retrieved successfully',
                 items: [{ $ref: '#/definitions/Order' }],
                 count: 'integer'
             }
         }
     }
  */
  try {
    const { query, filter } = req.body;
    let orders;

    let queryConditions = {
      include: [
        {
          model: User,
          attributes: { exclude: ["password"] },
          where: {
            username: {
              [Op.like]: `%${query}%`,
            },
          },
        },
      ],
    };

    if (filter) {
      queryConditions.where = { status: filter };
    }

    orders = await Order.findAll(queryConditions);

    res.json({
      status: "success",
      statuscode: 200,
      data: {
        result: "Orders retrieved successfully",
        items: orders,
        count: orders.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
      },
    });
  }
});

module.exports = router;
