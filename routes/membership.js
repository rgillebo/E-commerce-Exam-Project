const express = require("express");
const { Membership, User, Order, OrderItem } = require("../models");
const { authenticate } = require("../middleware/auth");
const router = express.Router();

// Get all membership statuses
router.get("/", async (req, res) => {
  /* #swagger.tags = ['Guest', 'User']
     #swagger.path = '/membership'
     #swagger.description = 'Endpoint to get all membership statuses'
     #swagger.responses[200] = {
         description: 'Successful retrieval of memberships',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Memberships found',
                 memberships: [
                     {
                         id: 1,
                         status: 'Bronze',
                         discount: 5,
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
                 memberships: []
             }
         }
     }
  */
  try {
    const memberships = await Membership.findAll();
    res.status(200).json({
      status: "success",
      statuscode: 200,
      data: {
        result: "Memberships found",
        memberships: memberships,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
        memberships: [],
      },
    });
  }
});

// Get membership status by membership ID
router.get("/:id", async (req, res) => {
  /* #swagger.tags = ['Guest', 'User']
     #swagger.path = '/membership/{id}'
     #swagger.description = 'Endpoint to get a membership status by ID'
     #swagger.parameters['id'] = {
         in: 'path',
         description: 'Membership ID',
         required: true,
         type: 'integer'
     }
     #swagger.responses[200] = {
         description: 'Successful retrieval of membership',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Membership found',
                 membership: {
                     id: 1,
                     status: 'Bronze',
                     discount: 5,
                     createdAt: '2023-06-10T00:00:00Z',
                     updatedAt: '2023-06-10T00:00:00Z'
                 }
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Membership not found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'Membership not found',
                 membership: {}
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
                 membership: {}
             }
         }
     }
  */
  try {
    const membership = await Membership.findByPk(req.params.id);
    if (!membership) {
      return res.status(404).json({
        status: "error",
        statuscode: 404,
        data: {
          result: "Membership not found",
          membership: {},
        },
      });
    }
    res.status(200).json({
      status: "success",
      statuscode: 200,
      data: {
        result: "Membership found",
        membership: membership,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
        membership: {},
      },
    });
  }
});

// Update membership status based on purchases
router.put("/update/:userId", authenticate, async (req, res) => {
  /* #swagger.tags = ['Admin']
     #swagger.path = '/membership/update/{userId}'
     #swagger.description = 'Endpoint to update membership status based on purchases'
     #swagger.parameters['userId'] = {
         in: 'path',
         description: 'ID of the user to update membership status for',
         required: true,
         type: 'integer'
     }
     #swagger.responses[200] = {
         description: 'Membership status updated',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Membership status updated',
                 membership_status: 'Gold'
             }
         }
     }
     #swagger.responses[404] = {
         description: 'User not found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'User not found',
                 membership_status: ''
             }
         }
     }
     #swagger.responses[500] = {
         description: 'Internal server error',
         schema: {
             status: 'error',
             statuscode: 500,
             data: {
                 result: 'Internal server error message',
                 membership_status: ''
             }
         }
     }
  */
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        statuscode: 404,
        data: {
          result: "User not found",
          membership_status: "",
        },
      });
    }

    const orders = await Order.findAll({
      where: { user_id: user.id, status: "Completed" },
      include: [{ model: OrderItem }],
    });

    let totalItemsPurchased = 0;
    orders.forEach((order) => {
      order.OrderItems.forEach((item) => {
        totalItemsPurchased += item.quantity;
      });
    });

    let newStatus;
    if (totalItemsPurchased >= 30) {
      newStatus = "Gold";
    } else if (totalItemsPurchased >= 15) {
      newStatus = "Silver";
    } else {
      newStatus = "Bronze";
    }

    await user.update({ membership_status: newStatus });
    res.status(200).json({
      status: "success",
      statuscode: 200,
      data: {
        result: "Membership status updated",
        membership_status: newStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
        membership_status: "",
      },
    });
  }
});

module.exports = router;
