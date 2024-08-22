const express = require("express");
const { Order, OrderItem, Product } = require("../models");
const { authenticate } = require("../middleware/auth");
const router = express.Router();

// Function to determine membership status based on discount
function getMembershipStatus(discount) {
  if (discount === 30) {
    return "Gold";
  } else if (discount === 15) {
    return "Silver";
  } else {
    return "Bronze";
  }
}

// Get all orders for the logged in user
router.get("/", authenticate, async (req, res) => {
  /* #swagger.tags = ['User']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/orders'
     #swagger.description = 'Endpoint to get all orders for the logged in user'
     #swagger.responses[200] = {
         description: 'Orders found',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Orders found',
                 orders: [
                     {
                         id: 1,
                         status: 'In progress',
                         order_number: 'abcdefgh',
                         discount: 0,
                         membership_status: 'Bronze',
                         createdAt: '2023-01-01T00:00:00.000Z',
                         updatedAt: '2023-01-01T00:00:00.000Z',
                         OrderItems: [
                             {
                                 id: 1,
                                 product_id: 1,
                                 quantity: 2,
                                 unit_price: 100,
                                 Product: {
                                     id: 1,
                                     name: 'Product Name',
                                     description: 'Product Description',
                                     price: 100,
                                     category_id: 1,
                                     brand_id: 1,
                                     quantity: 10,
                                     createdAt: '2023-01-01T00:00:00.000Z',
                                     updatedAt: '2023-01-01T00:00:00.000Z',
                                 }
                             }
                         ]
                     }
                 ]
             }
         }
     }
     #swagger.responses[404] = {
         description: 'No orders found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'No orders found',
                 orders: []
             }
         }
     }
     #swagger.responses[500] = {
         description: 'Internal Server Error',
         schema: {
             status: 'error',
             statuscode: 500,
             data: {
                 result: 'Error message',
                 orders: []
             }
         }
     }
  */
  try {
    const orders = await Order.findAll({
      where: { user_id: req.userId },
      include: [{ model: OrderItem, include: [Product] }],
    });

    if (orders.length === 0) {
      return res.status(404).json({
        status: "error",
        statuscode: 404,
        data: {
          result: "No orders found",
          orders: [],
        },
      });
    }

    res.status(200).json({
      status: "success",
      statuscode: 200,
      data: {
        result: "Orders found",
        orders: orders.map((order) => ({
          id: order.id,
          status: order.status,
          order_number: order.order_number,
          discount: order.discount,
          membership_status: getMembershipStatus(order.discount),
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          OrderItems: order.OrderItems.map((item) => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            Product: {
              id: item.Product.id,
              name: item.Product.name,
              description: item.Product.description,
              price: item.Product.price,
              category_id: item.Product.category_id,
              brand_id: item.Product.brand_id,
              quantity: item.Product.quantity,
              createdAt: item.Product.createdAt,
              updatedAt: item.Product.updatedAt,
            },
          })),
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
        orders: [],
      },
    });
  }
});

// Get order by ID for the logged in user
router.get("/:id", authenticate, async (req, res) => {
  /* #swagger.tags = ['User']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/orders/{id}'
     #swagger.description = 'Endpoint to get an order by ID for the logged in user'
     #swagger.parameters['id'] = {
         in: 'path',
         description: 'Order ID',
         required: true,
         type: 'integer'
     }
     #swagger.responses[200] = {
         description: 'Order found',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Order found',
                 order: {
                     id: 1,
                     status: 'In progress',
                     order_number: 'abcdefgh',
                     discount: 0,
                     membership_status: 'Bronze',
                     createdAt: '2023-01-01T00:00:00.000Z',
                     updatedAt: '2023-01-01T00:00:00.000Z',
                     OrderItems: [
                         {
                             id: 1,
                             product_id: 1,
                             quantity: 2,
                             unit_price: 100,
                             Product: {
                                 id: 1,
                                 name: 'Product Name',
                                 description: 'Product Description',
                                 price: 100,
                                 category_id: 1,
                                 brand_id: 1,
                                 quantity: 10,
                                 createdAt: '2023-01-01T00:00:00.000Z',
                                 updatedAt: '2023-01-01T00:00:00.000Z',
                             }
                         }
                     ]
                 }
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Order not found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'Order not found',
                 order: {}
             }
         }
     }
     #swagger.responses[500] = {
         description: 'Internal Server Error',
         schema: {
             status: 'error',
             statuscode: 500,
             data: {
                 result: 'Error message',
                 order: {}
             }
         }
     }
  */
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.userId },
      include: [{ model: OrderItem, include: [Product] }],
    });
    if (!order) {
      return res.status(404).json({
        status: "error",
        statuscode: 404,
        data: {
          result: "Order not found",
          order: {},
        },
      });
    }
    res.status(200).json({
      status: "success",
      statuscode: 200,
      data: {
        result: "Order found",
        order: {
          id: order.id,
          status: order.status,
          order_number: order.order_number,
          discount: order.discount,
          membership_status: getMembershipStatus(order.discount),
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          OrderItems: order.OrderItems.map((item) => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            Product: {
              id: item.Product.id,
              name: item.Product.name,
              description: item.Product.description,
              price: item.Product.price,
              category_id: item.Product.category_id,
              brand_id: item.Product.brand_id,
              quantity: item.Product.quantity,
              createdAt: item.Product.createdAt,
              updatedAt: item.Product.updatedAt,
            },
          })),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
        order: {},
      },
    });
  }
});

module.exports = router;
