const express = require("express");
const axios = require("axios");
const {
  User,
  Product,
  Category,
  Brand,
  Membership,
  Role,
} = require("../models");
const bcrypt = require("bcryptjs");
const router = express.Router();

// Route to initialize the database
router.post("/init", async (req, res) => {
  /* #swagger.tags = ['Admin']
     #swagger.path = '/utility/init'
     #swagger.description = 'Endpoint to initialize the database'
     #swagger.responses[200] = {
         description: 'Database successfully populated',
         schema: { message: 'Database successfully populated' }
     }
     #swagger.responses[400] = {
         description: 'Database is already populated',
         schema: { error: 'Database is already populated' }
     }
     #swagger.responses[500] = {
         description: 'Internal server error',
         schema: { error: 'Error message' }
     }
  */
  try {
    // Check if the database is already populated
    const usersCount = await User.count();
    if (usersCount > 0) {
      return res.status(400).json({ error: "Database is already populated" });
    }

    // Create memberships
    const memberships = await Membership.bulkCreate([
      { status: "Bronze", min_items: 0, max_items: 14, discount_percentage: 0 },
      {
        status: "Silver",
        min_items: 15,
        max_items: 29,
        discount_percentage: 15,
      },
      {
        status: "Gold",
        min_items: 30,
        max_items: null,
        discount_percentage: 30,
      },
    ]);

    // Create roles
    const adminRole = await Role.create({ id: 1, name: "Admin" });
    const userRole = await Role.create({ id: 2, name: "User" });

    // Create initial admin user
    const hashedPassword = await bcrypt.hash("P@ssword2023", 10);
    await User.create({
      username: "Admin",
      password: hashedPassword,
      email: "admin@noroff.no",
      firstname: "Admin",
      lastname: "Support",
      address: "Online",
      telephonenumber: "911",
      membership_status: "Bronze",
      role_id: adminRole.id,
    });

    // Fetch data from Noroff API
    const response = await axios.get(
      "http://backend.restapi.co.za/items/products"
    );
    const productsData = response.data.data;

    if (!Array.isArray(productsData)) {
      return res.status(500).json({ error: "Invalid API response format" });
    }

    // Helper functions to create categories and brands if they don't exist
    const getCategory = async (name) => {
      let category = await Category.findOne({ where: { name } });
      if (!category) {
        category = await Category.create({ name });
      }
      return category;
    };

    const getBrand = async (name) => {
      let brand = await Brand.findOne({ where: { name } });
      if (!brand) {
        brand = await Brand.create({ name });
      }
      return brand;
    };

    // Populate products, categories, and brands
    for (const productData of productsData) {
      const category = await getCategory(productData.category);
      const brand = await getBrand(productData.brand);
      await Product.create({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        quantity: productData.quantity,
        category_id: category.id,
        brand_id: brand.id,
      });
    }

    res.json({ message: "Database successfully populated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// GET route for browser access to initialize the database
router.get("/init", async (req, res) => {
  /* #swagger.tags = ['Admin']
     #swagger.path = '/utility/init'
     #swagger.description = 'Endpoint for browser access to initialize the database'
     #swagger.responses[200] = {
         description: 'Form for initializing the database rendered successfully',
         content: {
             'text/html': {
                 schema: {
                     type: 'string',
                     example: '<form method="POST" action="/utility/init"><button type="submit">Initialize Database</button></form>'
                 }
             }
         }
     }
     #swagger.responses[500] = {
         description: 'Internal server error',
         schema: {
             error: 'Internal server error message'
         }
     }
  */
  try {
    res.send(
      '<form method="POST" action="/utility/init"><button type="submit">Initialize Database</button></form>'
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
