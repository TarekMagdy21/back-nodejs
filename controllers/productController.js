const Product = require("../models/Product");
const User = require("../models/User");
// @desc Create Product
// @route POST /product
// @access Public or private will see it
const createProduct = async (req, res) => {
  const {
    title,
    rating,
    numberOfOrders,
    stock,
    price,
    discountPercentage,
    description,
    color,
    material,
    brand,
    size,
    shipping,
    isFavorite,
    images,
  } = req.body;
  if (!title || !stock || !price || !description || shipping?.cost < 0 || images.length == 0) {
    return res.status(400).json({message: "All fields are required"});
  }
  try {
    const result = await Product.create({
      title,
      brand,
      color,
      description,
      discountPercentage,
      images,
      isFavorite,
      material,
      numberOfOrders,
      price,
      rating,
      shipping,
      size,
      stock,
    });
    res.status(200).json({message: "Product Created Successfully", product: result});
  } catch (err) {
    res.status(500).json({message: "Internal Server Error"});
  }
};

// @desc Get All Products
// @route GET /product
// @access Public or private will see it
const getProducts = async (req, res) => {
  try {
    let filters = {};
    let paginationOptions = {};
    let sortOptions = {};

    // Check if a specific category is provided in the query parameters
    if (req.query.category) {
      filters.category = req.query.category;
    }

    // Check if a specific brand is provided in the query parameters
    if (req.query.brand) {
      filters.brand = req.query.brand.split(",").map((brand) => brand.trim());
    }

    // Check if a specific color is provided in the query parameters
    if (req.query.color) {
      filters.color = req.query.color.split(",").map((color) => color.trim());
    }

    // Check if a specific rating is provided in the query parameters
    if (req.query.rating) {
      filters.rating = req.query.rating.split(",").map((rating) => rating.trim());
    }

    // Check if min and/or max price is provided in the query parameters
    if (req.query.minPrice || req.query.maxPrice) {
      filters.price = {};
      if (req.query.minPrice) {
        filters.price.$gte = parseInt(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filters.price.$lte = parseInt(req.query.maxPrice);
      }
    }

    // Check if a title search is specified in the query parameters
    if (req.query.title) {
      filters.title = new RegExp(req.query.title, "i"); // Case-insensitive search
    }

    // Check if page and limit are provided in the query parameters for pagination
    if (req.query.page && req.query.limit) {
      const page = parseInt(req.query.page) + 1;
      const limit = parseInt(req.query.limit);
      const skip = (page - 1) * limit;

      paginationOptions = {skip, limit};
    }

    // Check if sorting is specified in the query parameters
    if (req.query.sort) {
      if (req.query.sort === "bestrated") {
        sortOptions.rating = -1; // Sort by highest rating in descending order
      } else if (req.query.sort === "latest") {
        sortOptions.createdAt = -1; // Sort by latest createdAt timestamp in descending order
      }
    }

    // Get the total count of filtered products
    const totalCount = await Product.countDocuments(filters);

    // Get the filtered products with pagination and sorting
    const products = await Product.find(filters, {}, paginationOptions).sort(sortOptions);

    // Send the response with total count and filtered products
    res.json({totalCount, products});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Internal Server Error"});
  }
};

const getProductsCategories = async (req, res) => {
  console.log(req.params);
  try {
    let products;
    if (req.params.category.split("category=")[1].replace(/\s/g, "") == "all") {
      products = await Product.find({});
    } else {
      products = await Product.find({
        category: req.params.category.split("category=")[1].replace(/\s/g, ""),
      });
    }
    let productsCategories = [...new Set(products.map((product) => product.category))];
    let productsBrands = [...new Set(products.map((product) => product.brand))];
    let productsColors = [...new Set(products.map((product) => product.color))];
    let productsRatings = [...new Set(products.map((product) => product.rating))];
    res.status(200).json({
      cats: productsCategories,
      brands: productsBrands,
      colors: productsColors,
      ratings: productsRatings,
    });
  } catch (err) {
    res.status(500).json({err: "Internal Server Error"});
  }
};
const toggleFavorite = async (req, res) => {
  try {
    const userId = req.query.userId;
    const productId = req.query.productId;

    // Validate user ID and product ID
    if (!userId || !productId) {
      return res.status(400).json({error: "Invalid user or product ID."});
    }

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({message: "User not found."});
    }

    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({message: "Product not found."});
    }

    // Check if the product is already in the wishlist
    const isProductInWishlist = user.wishlist.includes(productId);

    // Toggle the product's favorite status in the wishlist
    if (isProductInWishlist) {
      user.wishlist.pull(productId);
    } else {
      user.wishlist.push(productId);
    }

    // Save the updated user
    await user.save();

    return res
      .status(200)
      .json({message: "Favorite status toggled successfully.", wishlist: user.wishlist});
  } catch (error) {
    console.error(error);
    return res.status(500).json({error: "Internal server error."});
  }
};
const getWishlist = async (req, res) => {
  try {
    const userId = req.query.userId;

    // Validate user ID
    if (!userId) {
      return res.status(400).json({error: "Invalid user ID."});
    }

    // Find the user by ID
    const user = await User.findById(userId).populate("wishlist");

    if (!user) {
      return res.status(404).json({message: "User not found."});
    }

    return res.status(200).json({wishlist: user.wishlist});
  } catch (error) {
    console.error(error);
    return res.status(500).json({error: "Internal server error."});
  }
};
module.exports = {
  createProduct,
  getProducts,
  getProductsCategories,
  toggleFavorite,
  getWishlist,
};
