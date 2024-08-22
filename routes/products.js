const express = require("express");
const { Product, Category, Brand } = require("../models");
const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  /* #swagger.tags = ['Guest', 'User']
     #swagger.path = '/products'
     #swagger.description = 'Endpoint to get all products'
     #swagger.responses[200] = {
         description: 'Successful retrieval of products',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Products found',
                 products: [{
                     name: 'Product name',
                     id: 1,
                     description: 'Product description',
                     unitprice: 100.00,
                     discount: 10,
                     date_added: '2023-06-10',
                     quantity: 10,
                     isdeleted: false,
                     createdAt: '2023-06-10T00:00:00Z',
                     BrandId: 1,
                     CategoryId: 1,
                 }]
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
                 products: []
             }
         }
     }
  */
  try {
    const products = await Product.findAll({
      where: { is_deleted: false },
      include: [Category, Brand],
    });

    const formattedProducts = products.map((product) => ({
      name: product.name,
      id: product.id,
      description: product.description,
      unitprice: product.price,
      discount: product.discount,
      date_added: product.date_added,
      quantity: product.quantity,
      isdeleted: product.is_deleted,
      createdAt: product.createdAt,
      BrandId: product.BrandId,
      CategoryId: product.CategoryId,
    }));

    res.status(200).json({
      status: "success",
      statuscode: 200,
      data: {
        result: "Products found",
        products: formattedProducts,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
        products: [],
      },
    });
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  /* #swagger.tags = ['Guest', 'User']
     #swagger.path = '/products/{id}'
     #swagger.description = 'Endpoint to get a product by ID'
     #swagger.parameters['id'] = {
         in: 'path',
         description: 'Product ID',
         required: true,
         type: 'integer'
     }
     #swagger.responses[200] = {
         description: 'Successful retrieval of product',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Product found',
                 products: {
                     name: 'Product name',
                     id: 1,
                     description: 'Product description',
                     unitprice: 100.00,
                     discount: 10,
                     date_added: '2023-06-10',
                     quantity: 10,
                     isdeleted: false,
                     createdAt: '2023-06-10T00:00:00Z',
                     BrandId: 1,
                     CategoryId: 1,
                 }
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Product not found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'Product not found',
                 products: []
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
                 products: []
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
          products: [],
        },
      });
    }

    const formattedProduct = {
      name: product.name,
      id: product.id,
      description: product.description,
      unitprice: product.price,
      discount: product.discount,
      date_added: product.date_added,
      quantity: product.quantity,
      isdeleted: product.is_deleted,
      createdAt: product.createdAt,
      BrandId: product.BrandId,
      CategoryId: product.CategoryId,
    };

    res.status(200).json({
      status: "success",
      statuscode: 200,
      data: {
        result: "Product found",
        products: formattedProduct,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
        products: [],
      },
    });
  }
});

module.exports = router;
