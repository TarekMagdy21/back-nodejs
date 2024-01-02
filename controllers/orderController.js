const Order = require("../models/Order");
const Cart = require("../models/Cart");

exports.getOrders = async (req, res) => {
  try {
    const userId = req.query.userId;

    // Validate user ID
    if (!userId) {
      return res.status(400).json({error: "Invalid user ID."});
    }

    // Find orders for the user
    const orders = await Order.find({user: userId}).populate("products.product", "name price");

    if (!orders || orders.length === 0) {
      return res.status(404).json({message: "Orders not found."});
    }

    // Calculate total price for each order
    const ordersWithTotalPrice = orders.map((order) => {
      const totalPrice = order.products.reduce((acc, product) => {
        return acc + product.product.price * product.quantity;
      }, 0);
      return {
        ...order._doc,
        totalPrice: totalPrice,
      };
    });
    return res.status(200).json({orders: ordersWithTotalPrice});
  } catch (error) {
    console.error(error);
    return res.status(500).json({error: "Internal server error."});
  }
};

exports.addOrder = async (req, res) => {
  try {
    const {userId, cartId, shippingAddress, totalPrice, products} = req.body;

    // Validate request parameters
    if (
      !userId ||
      !cartId ||
      !shippingAddress ||
      !totalPrice ||
      !products ||
      products.length === 0
    ) {
      return res.status(400).json({error: "Invalid request parameters."});
    }

    // Create a new order
    const order = new Order({
      user: userId,
      cart: cartId,
      shippingAddress,
      totalPrice,
      products,
    });

    // Save the order
    await order.save();

    // Optionally, you can update the status of the cart to indicate that it has been used for an order
    const cart = await Cart.findById(cartId);
    if (cart) {
      cart.status = "Used";
      await cart.save();
    }

    return res.status(200).json({message: "Order added successfully."});
  } catch (error) {
    console.error(error);
    return res.status(500).json({error: "Internal server error."});
  }
};

exports.editOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId; // Assuming the order ID is provided as a parameter

    // Validate order ID
    if (!orderId) {
      return res.status(400).json({error: "Invalid order ID."});
    }

    const {status} = req.body;

    // Validate request parameters
    if (
      !status ||
      !["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].includes(status)
    ) {
      return res.status(400).json({error: "Invalid status value."});
    }

    // Find the order by ID and update the status
    const order = await Order.findByIdAndUpdate(orderId, {status}, {new: true});

    if (!order) {
      return res.status(404).json({message: "Order not found."});
    }

    return res.status(200).json({order});
  } catch (error) {
    console.error(error);
    return res.status(500).json({error: "Internal server error."});
  }
};
