const Cart = require("../models/Cart"); // Update the path to your cart model

exports.addToCart = async (req, res) => {
  try {
    const {userId, items} = req.body;

    // Validate user and items
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({error: "Invalid request parameters."});
    }

    // Find the user's cart or create a new one if it doesn't exist
    let cart = await Cart.findOne({user: userId});

    if (!cart) {
      cart = new Cart({user: userId, items: []});
    }

    // Add items to the cart
    items.forEach((item) => {
      const existingItem = cart.items.find((cartItem) => cartItem.product.equals(item.product));

      if (existingItem) {
        // If the item already exists in the cart, update the quantity
        existingItem.quantity += item.quantity;
      } else {
        // If the item is not in the cart, add it
        cart.items.push({product: item.product, quantity: item.quantity});
      }
    });

    // Save the updated cart
    await cart.save();

    return res.status(200).json({message: "Items added to the cart successfully."});
  } catch (error) {
    console.error(error);
    return res.status(500).json({error: "Internal server error."});
  }
};
exports.getCartItems = async (req, res) => {
  try {
    const userId = req.query.userId;

    // Validate user ID
    if (!userId) {
      return res.status(400).json({error: "Invalid user ID."});
    }

    // Find the user's cart
    const cart = await Cart.findOne({user: userId}).populate("items.product");
    if (!cart) {
      return res.status(404).json({message: "Cart not found."});
    }

    // Calculate total price before discount
    const totalPriceBeforeDiscount = cart.items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );

    // Calculate total price with dynamic discount
    const totalPriceAfterDiscount = cart.items.reduce((acc, item) => {
      const product = item.product;
      const itemPrice = product.price * item.quantity;
      const discount = (product.discountPercentage / 100) * itemPrice;
      return acc + itemPrice - discount;
    }, 0);
    // Prepare response with items, total price before discount, total price after discount, and dynamic discount
    const response = {
      id: cart._id,
      items: cart.items,
      totalPriceBeforeDiscount: totalPriceBeforeDiscount,
      totalPriceAfterDiscount: totalPriceAfterDiscount,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({error: "Internal server error."});
  }
};

exports.removeProductFromCart = async (req, res) => {
  try {
    const {userId, productId} = req.body;

    // Validate user and product ID
    if (!userId || !productId) {
      return res.status(400).json({error: "Invalid request parameters."});
    }

    // Find the user's cart
    const cart = await Cart.findOne({user: userId});

    if (!cart) {
      return res.status(404).json({message: "Cart not found."});
    }

    // Remove the entire product from the cart
    cart.items = cart.items.filter((item) => !item.product.equals(productId));

    // Save the updated cart
    await cart.save();

    return res.status(200).json({message: "Product removed from the cart successfully."});
  } catch (error) {
    console.error(error);
    return res.status(500).json({error: "Internal server error."});
  }
};

exports.reduceQuantityInCart = async (req, res) => {
  try {
    const {userId, productId, quantity} = req.body;

    // Validate user, product ID, and quantity
    if (!userId || !productId || !quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({error: "Invalid request parameters."});
    }

    // Find the user's cart
    const cart = await Cart.findOne({user: userId});

    if (!cart) {
      return res.status(404).json({message: "Cart not found."});
    }

    // Find the item in the cart
    const cartItem = cart.items.find((item) => item.product.equals(productId));

    if (!cartItem) {
      return res.status(404).json({message: "Item not found in the cart."});
    }

    // If the requested quantity is less than the current quantity, check if it's less than 1
    if (cartItem.quantity - quantity < 1) {
      return res.status(400).json({error: "Quantity cannot be reduced below 1."});
    }

    // Update the quantity
    cartItem.quantity -= quantity;

    // Save the updated cart
    await cart.save();

    return res.status(200).json({message: "Quantity reduced successfully."});
  } catch (error) {
    console.error(error);
    return res.status(500).json({error: "Internal server error."});
  }
};

exports.removeAllProductsFromCart = async (req, res) => {
  try {
    const {userId} = req.body;

    // Validate user ID
    if (!userId) {
      return res.status(400).json({error: "Invalid request parameters."});
    }

    // Find the user's cart
    const cart = await Cart.findOne({user: userId});

    if (!cart) {
      return res.status(404).json({message: "Cart not found."});
    }

    // Remove all products from the cart
    cart.items = [];

    // Save the updated cart
    await cart.save();

    return res.status(200).json({message: "All products removed from the cart successfully."});
  } catch (error) {
    console.error(error);
    return res.status(500).json({error: "Internal server error."});
  }
};
