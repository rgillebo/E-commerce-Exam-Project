const express = require("express");
const { Brand } = require("../models");
const router = express.Router();

// Get all brands
router.get("/", async (req, res) => {
  /* #swagger.tags = ['Guest', 'User']
     #swagger.path = '/brands'
     #swagger.description = 'Endpoint to get all brands'
     #swagger.responses[200] = {
         description: 'Successful retrieval of brands',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Brands found',
                 brands: [
                     {
                         id: 1,
                         name: 'Brand name',
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
                 brands: []
             }
         }
     }
  */
  try {
    const brands = await Brand.findAll();
    res.status(200).json({
      status: "success",
      statuscode: 200,
      data: {
        result: "Brands found",
        brands: brands,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
        brands: [],
      },
    });
  }
});

// Get brand by ID
router.get("/:id", async (req, res) => {
  /* #swagger.tags = ['Guest', 'User']
     #swagger.path = '/brands/{id}'
     #swagger.description = 'Endpoint to get a brand by ID'
     #swagger.parameters['id'] = {
         in: 'path',
         description: 'Brand ID',
         required: true,
         type: 'integer'
     }
     #swagger.responses[200] = {
         description: 'Successful retrieval of brand',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Brand found',
                 brand: {
                     id: 1,
                     name: 'Brand name',
                     createdAt: '2023-06-10T00:00:00Z',
                     updatedAt: '2023-06-10T00:00:00Z'
                 }
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Brand not found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'Brand not found',
                 brand: {}
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
                 brand: {}
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
          brand: {},
        },
      });
    }
    res.status(200).json({
      status: "success",
      statuscode: 200,
      data: {
        result: "Brand found",
        brand: brand,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
        brand: {},
      },
    });
  }
});

module.exports = router;
