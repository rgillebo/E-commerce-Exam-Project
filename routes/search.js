require("dotenv").config();
const express = require("express");
const sequelize = require("../config/database");
const router = express.Router();

router.post("/", async (req, res) => {
  /* #swagger.tags = ['Guest', 'User']
     #swagger.path = '/search'
     #swagger.description = 'Endpoint for searching products'
     #swagger.parameters['obj'] = {
         in: 'body',
         description: 'Search query and filter type',
         required: true,
         schema: {
             query: 'apple',
             filter: 'brand'
         }
     }
     #swagger.responses[200] = {
         description: 'Products found',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Products found',
                 products: [
                     {
                         name: 'Product Name',
                         id: 1,
                         description: 'Product Description',
                         unitprice: 100,
                         quantity: 10,
                         isdeleted: false,
                         createdAt: '2023-06-01T00:00:00.000Z',
                         brand: 'Brand Name',
                         category: 'Category Name'
                     }
                 ]
             }
         }
     }
     #swagger.responses[400] = {
         description: 'Bad Request',
         schema: {
             status: 'error',
             statuscode: 400,
             data: {
                 result: 'Query and filter are required.',
                 products: []
             }
         }
     }
     #swagger.responses[404] = {
         description: 'No products found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'No products found',
                 products: []
             }
         }
     }
     #swagger.responses[500] = {
         description: 'Internal Server Error',
         schema: {
             status: 'error',
             statuscode: 500,
             data: {
                 result: 'Internal Server Error',
                 products: []
             }
         }
     }
  */
  try {
    const { query, filter } = req.body;

    if (!query || !filter) {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        data: {
          result: "Query and filter are required.",
          products: [],
        },
      });
    }

    let sql;

    switch (filter) {
      case "category":
        sql = `
          SELECT p.*, c.name as "Category.name", b.name as "Brand.name"
          FROM products p
          JOIN categories c ON p.category_id = c.id
          JOIN brands b ON p.brand_id = b.id
          WHERE c.name LIKE :search_query
        `;
        break;
      case "brand":
        sql = `
          SELECT p.*, c.name as "Category.name", b.name as "Brand.name"
          FROM products p
          JOIN categories c ON p.category_id = c.id
          JOIN brands b ON p.brand_id = b.id
          WHERE b.name LIKE :search_query
        `;
        break;
      case "name":
        sql = `
          SELECT p.*, c.name as "Category.name", b.name as "Brand.name"
          FROM products p
          JOIN categories c ON p.category_id = c.id
          JOIN brands b ON p.brand_id = b.id
          WHERE p.name LIKE :search_query
        `;
        break;
      default:
        return res.status(400).json({
          status: "error",
          statuscode: 400,
          data: {
            result: "Invalid filter type.",
            products: [],
          },
        });
    }

    const results = await sequelize.query(sql, {
      replacements: { search_query: `%${query}%` },
      type: sequelize.QueryTypes.SELECT,
    });

    if (!results || results.length === 0) {
      console.error("No valid results returned from query");
      return res.status(404).json({
        status: "error",
        statuscode: 404,
        data: {
          result: "No products found",
          products: [],
        },
      });
    }

    const products = results.map((result) => ({
      name: result.name,
      id: result.id,
      description: result.description,
      unitprice: result.price,
      quantity: result.quantity,
      isdeleted: result.is_deleted,
      createdAt: result.createdAt,
      brand: result["Brand.name"],
      category: result["Category.name"],
    }));

    res.status(200).json({
      status: "success",
      statuscode: 200,
      data: {
        result: "Products found",
        products,
      },
    });
  } catch (error) {
    console.error("Error in /search:", error);
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: "Internal Server Error",
        products: [],
      },
    });
  }
});

module.exports = router;
