const express = require("express");
const { Category } = require("../models");
const router = express.Router();

// Get all categories
router.get("/", async (req, res) => {
  /* #swagger.tags = ['Guest', 'User']
     #swagger.path = '/categories'
     #swagger.description = 'Endpoint to get all categories'
     #swagger.responses[200] = {
         description: 'Successful retrieval of categories',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Categories found',
                 categories: [
                     {
                         id: 1,
                         name: 'Category name',
                         createdAt: '2023-06-10T00:00:00Z',
                         updatedAt: '2023-06-10T00:00:00Z'
                     }
                 ]
             }
         }
     }
     #swagger.responses[500] = {
         description: 'Internal server error',
         schema: {
             status: 'error',
             statuscode: 500,
             data: {
                 result: 'Error message',
                 categories: []
             }
         }
     }
  */
  try {
    const categories = await Category.findAll();
    res.status(200).json({
      status: "success",
      statuscode: 200,
      data: {
        result: "Categories found",
        categories: categories,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
        categories: [],
      },
    });
  }
});

// Get category by ID
router.get("/:id", async (req, res) => {
  /* #swagger.tags = ['Guest', 'User']
     #swagger.path = '/categories/{id}'
     #swagger.description = 'Endpoint to get a category by ID'
     #swagger.parameters['id'] = {
         in: 'path',
         description: 'Category ID',
         required: true,
         type: 'integer'
     }
     #swagger.responses[200] = {
         description: 'Successful retrieval of category',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Category found',
                 category: {
                     id: 1,
                     name: 'Category name',
                     createdAt: '2023-06-10T00:00:00Z',
                     updatedAt: '2023-06-10T00:00:00Z'
                 }
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Category not found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'Category not found',
                 category: {}
             }
         }
     }
     #swagger.responses[500] = {
         description: 'Internal server error',
         schema: {
             status: 'error',
             statuscode: 500,
             data: {
                 result: 'Error message',
                 category: {}
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
          category: {},
        },
      });
    }
    res.status(200).json({
      status: "success",
      statuscode: 200,
      data: {
        result: "Category found",
        category: category,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
        category: {},
      },
    });
  }
});

module.exports = router;
