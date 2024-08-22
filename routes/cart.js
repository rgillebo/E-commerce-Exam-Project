const express = require("express");
const { Sequelize } = require("sequelize");
const {
  Cart,
  CartItem,
  Product,
  User,
  Membership,
  Order,
  OrderItem,
} = require("../models");
const { authenticate } = require("../middleware/auth");
const router = express.Router();

// Function to generate a unique order number
function generateOrderNumber() {
  return Math.random().toString(36).substr(2, 8);
}

// Function to determine membership status based on discount
function getMembershipStatus(discount) {
  const discountPercentage = parseInt(discount, 10);
  if (discountPercentage === 30) {
    return "Gold";
  } else if (discountPercentage === 15) {
    return "Silver";
  } else {
    return "Bronze";
  }
}

// Add a product to the cart
router.post("/", authenticate, async (req, res) => {
  /* #swagger.tags = ['User']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/cart'
     #swagger.description = 'Endpoint to add a product to the cart'
     #swagger.parameters['obj'] = {
         in: 'body',
         description: 'Product ID and quantity',
         required: true,
         schema: {
             product_id: 1,
             quantity: 2
         }
     }
     #swagger.responses[201] = {
         description: 'Product added to cart',
         schema: {
             status: 'success',
             statuscode: 201,
             data: {
                 result: 'Product added to cart',
                 cartItem: {
                     cart_id: 1,
                     product_id: 1,
                     quantity: 2,
                     unit_price: 100
                 }
             }
         }
     }
     #swagger.responses[400] = {
         description: 'Bad Request',
         schema: {
             status: 'error',
             statuscode: 400,
             data: {
                 result: 'Error message'
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Not Found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'User not found' | 'Product not found'
             }
         }
     }
  */
  try {
    const { product_id, quantity } = req.body;
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        statuscode: 404,
        data: {
          result: "User not found",
        },
      });
    }

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        status: "error",
        statuscode: 404,
        data: {
          result: "Product not found",
        },
      });
    }

    if (product.is_deleted) {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        data: {
          result: "This product is no longer available",
        },
      });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        data: {
          result: "Not enough stock available",
        },
      });
    }

    let cart = await Cart.findOne({
      where: { user_id: user.id, checked_out: false },
    });
    if (!cart) {
      cart = await Cart.create({ user_id: user.id, checked_out: false });
    }

    let cartItem = await CartItem.findOne({
      where: { cart_id: cart.id, product_id },
      paranoid: false,
    });

    if (cartItem) {
      if (cartItem.deleted_at) {
        // Restore the soft-deleted item
        await cartItem.update({ deleted_at: null, quantity: quantity });
      } else {
        if (product.quantity < cartItem.quantity + quantity) {
          return res.status(400).json({
            status: "error",
            statuscode: 400,
            data: {
              result: "Not enough stock available",
            },
          });
        }
        await cartItem.update({ quantity: cartItem.quantity + quantity });
      }
    } else {
      cartItem = await CartItem.create({
        cart_id: cart.id,
        product_id,
        quantity,
        unit_price: product.price,
      });
    }

    res.status(201).json({
      status: "success",
      statuscode: 201,
      data: {
        result: "Product added to cart",
        cartItem,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      statuscode: 400,
      data: {
        result: error.message,
      },
    });
  }
});

// View cart items
router.get("/", authenticate, async (req, res) => {
  /* #swagger.tags = ['User']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/cart'
     #swagger.description = 'Endpoint to view cart items'
     #swagger.responses[200] = {
         description: 'Cart items retrieved',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Cart items retrieved',
                 cart: {
                     id: 1,
                     user_id: 1,
                     checked_out: false,
                     CartItems: [
                         {
                             id: 1,
                             cart_id: 1,
                             product_id: 1,
                             quantity: 2,
                             unit_price: 100,
                             Product: {
                                 id: 1,
                                 name: 'Product Name',
                                 description: 'Product Description'
                             }
                         }
                     ]
                 }
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Not Found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'User not found' | 'Cart not found'
             }
         }
     }
     #swagger.responses[500] = {
         description: 'Internal Server Error',
         schema: {
             status: 'error',
             statuscode: 500,
             data: {
                 result: 'Error message'
             }
         }
     }
  */
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        statuscode: 404,
        data: {
          result: "User not found",
        },
      });
    }

    const cart = await Cart.findOne({
      where: { user_id: user.id, checked_out: false },
      include: {
        model: CartItem,
        where: { deleted_at: null },
        include: [Product],
      },
    });

    if (!cart) {
      return res.status(404).json({
        status: "error",
        statuscode: 404,
        data: {
          result: "Cart not found",
        },
      });
    }

    res.status(200).json({
      status: "success",
      statuscode: 200,
      data: {
        result: "Cart items retrieved",
        cart,
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

// Update cart item quantity
router.put("/", authenticate, async (req, res) => {
  /* #swagger.tags = ['User']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/cart'
     #swagger.description = 'Endpoint to update cart item quantity'
     #swagger.parameters['obj'] = {
         in: 'body',
         description: 'Cart ID, Cart Item ID, and quantity',
         required: true,
         schema: {
             cart_id: 1,
             cart_item_id: 1,
             quantity: 2
         }
     }
     #swagger.responses[200] = {
         description: 'Cart item quantity updated',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Cart item quantity updated',
                 cartItem: {
                     id: 1,
                     cart_id: 1,
                     product_id: 1,
                     quantity: 2,
                     unit_price: 100
                 }
             }
         }
     }
     #swagger.responses[400] = {
         description: 'Bad Request',
         schema: {
             status: 'error',
             statuscode: 400,
             data: {
                 result: 'Error message'
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Not Found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'Cart not found or already checked out' | 'Cart item not found'
             }
         }
     }
  */
  try {
    const { cart_id, cart_item_id, quantity } = req.body;
    const cart = await Cart.findOne({
      where: { id: cart_id, user_id: req.userId, checked_out: false },
    });
    if (!cart) {
      return res.status(404).json({
        status: "error",
        statuscode: 404,
        data: {
          result: "Cart not found or already checked out",
        },
      });
    }

    const cartItem = await CartItem.findOne({
      where: { id: cart_item_id, cart_id: cart.id },
    });
    if (!cartItem) {
      return res.status(404).json({
        status: "error",
        statuscode: 404,
        data: {
          result: "Cart item not found",
        },
      });
    }

    const product = await Product.findByPk(cartItem.product_id);
    if (product.is_deleted) {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        data: {
          result: "This product is no longer available",
        },
      });
    }
    if (product.quantity < parseInt(quantity, 10)) {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        data: {
          result: "Not enough stock available",
        },
      });
    }

    await cartItem.update({ quantity: parseInt(quantity, 10) });
    res.status(200).json({
      status: "success",
      statuscode: 200,
      data: {
        result: "Cart item quantity updated",
        cartItem,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      statuscode: 400,
      data: {
        result: error.message,
      },
    });
  }
});

// Remove item from cart
router.delete("/", authenticate, async (req, res) => {
  /* #swagger.tags = ['User']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/cart'
     #swagger.description = 'Endpoint to remove an item from the cart'
     #swagger.parameters['obj'] = {
         in: 'body',
         description: 'Cart ID and Cart Item ID',
         required: true,
         schema: {
             cart_id: 1,
             cart_item_id: 1
         }
     }
     #swagger.responses[200] = {
         description: 'Cart item removed (soft delete)',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Cart item removed (soft delete)'
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Not Found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'Cart not found or already checked out' | 'Cart item not found'
             }
         }
     }
     #swagger.responses[500] = {
         description: 'Internal Server Error',
         schema: {
             status: 'error',
             statuscode: 500,
             data: {
                 result: 'Error message'
             }
         }
     }
  */
  try {
    const { cart_id, cart_item_id } = req.body;
    const cart = await Cart.findOne({
      where: { id: cart_id, user_id: req.userId, checked_out: false },
    });
    if (!cart) {
      return res.status(404).json({
        status: "error",
        statuscode: 404,
        data: {
          result: "Cart not found or already checked out",
        },
      });
    }

    const cartItem = await CartItem.findOne({
      where: { id: cart_item_id, cart_id: cart.id },
    });
    if (!cartItem) {
      return res.status(404).json({
        status: "error",
        statuscode: 404,
        data: {
          result: "Cart item not found",
        },
      });
    }

    await cartItem.update({ deleted_at: new Date() });
    res.status(200).json({
      status: "success",
      statuscode: 200,
      data: {
        result: "Cart item removed (soft delete)",
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

// Checkout cart
router.post("/checkout/now", authenticate, async (req, res) => {
  /* #swagger.tags = ['User']
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.path = '/cart/checkout/now'
     #swagger.description = 'Endpoint to checkout the cart'
     #swagger.responses[200] = {
         description: 'Cart checked out successfully',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'Cart checked out successfully',
                 order: {
                     id: 1,
                     user_id: 1,
                     status: 'In progress',
                     discount: 0,
                     order_number: 'abcdefgh',
                     membership_status: 'Bronze'
                 },
                 totalAmount: 100,
                 discountAmount: 0,
                 finalAmount: 100
             }
         }
     }
     #swagger.responses[400] = {
         description: 'Bad Request',
         schema: {
             status: 'error',
             statuscode: 400,
             data: {
                 result: 'Error message'
             }
         }
     }
     #swagger.responses[404] = {
         description: 'Not Found',
         schema: {
             status: 'error',
             statuscode: 404,
             data: {
                 result: 'User not found' | 'Cart not found'
             }
         }
     }
     #swagger.responses[500] = {
         description: 'Internal Server Error',
         schema: {
             status: 'error',
             statuscode: 500,
             data: {
                 result: 'Error message'
             }
         }
     }
  */
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        statuscode: 404,
        data: {
          result: "User not found",
        },
      });
    }

    const cart = await Cart.findOne({
      where: { user_id: user.id, checked_out: false },
      include: {
        model: CartItem,
        where: { deleted_at: null },
        include: [Product],
      },
    });

    if (!cart) {
      return res.status(404).json({
        status: "error",
        statuscode: 404,
        data: {
          result: "Cart not found",
        },
      });
    }

    const cartItems = await CartItem.findAll({
      where: { cart_id: cart.id, deleted_at: null },
    });

    let totalAmount = 0;

    for (const item of cartItems) {
      const product = await Product.findByPk(item.product_id);
      if (product.is_deleted) {
        return res.status(400).json({
          status: "error",
          statuscode: 400,
          data: {
            result: `Product ${product.name} is no longer available`,
          },
        });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          status: "error",
          statuscode: 400,
          data: {
            result: `Not enough stock for product ${product.name}`,
          },
        });
      }
      totalAmount += item.quantity * item.unit_price;
      await product.update({ quantity: product.quantity - item.quantity });
    }

    // Calculate discount based on membership status
    const membership = await Membership.findOne({
      where: { status: user.membership_status },
    });
    const discount = membership ? membership.discount_percentage : 0;

    const discountAmount = totalAmount * (discount / 100);
    const finalAmount = totalAmount - discountAmount;

    // Generate a unique order number
    const orderNumber = generateOrderNumber();

    // Create order
    const order = await Order.create({
      user_id: user.id,
      status: "In progress",
      discount: discount,
      order_number: orderNumber,
    });

    for (const item of cartItems) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      });
    }

    await cart.update({ checked_out: true });

    // Update user membership status based on the number of items purchased
    const totalItemsPurchased = await OrderItem.sum("quantity", {
      where: {
        order_id: {
          [Sequelize.Op.in]: Sequelize.literal(
            `(SELECT id FROM orders WHERE user_id = ${user.id})`
          ),
        },
      },
    });

    let newStatus = "Bronze";
    if (totalItemsPurchased >= 15 && totalItemsPurchased < 30) {
      newStatus = "Silver";
    } else if (totalItemsPurchased >= 30) {
      newStatus = "Gold";
    }
    await user.update({ membership_status: newStatus });

    // Include the membership status in the response
    const membershipStatus = getMembershipStatus(discount);

    res.status(200).json({
      status: "success",
      statuscode: 200,
      data: {
        result: "Cart checked out successfully",
        order: { ...order.toJSON(), membership_status: membershipStatus },
        totalAmount,
        discountAmount,
        finalAmount,
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
