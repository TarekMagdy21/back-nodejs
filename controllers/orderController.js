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

    return res.status(200).json({orders});
  } catch (error) {
    console.error(error);
    return res.status(500).json({error: "Internal server error."});
  }
};

exports.addOrder = async (req, res) => {
  try {
    const { userId, cartId, shippingAddress, totalPrice, products } = req.body;

    // Validate request parameters
    if (!userId || !cartId || !shippingAddress || !totalPrice || !products || products.length === 0) {
      return res.status(400).json({ error: "Invalid request parameters." });
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

    return res.status(200).json({ message: "Order added successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
};