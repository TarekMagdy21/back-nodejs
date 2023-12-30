const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  numberOfOrders: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
  },
  description: {
    type: String,
    required: true,
  },
  color: {
    type: String,
  },
  material: {
    type: String,
  },
  category: {
    type: String,
    enum: [
      "Computers",
      "MiniGadgets",
      "Tablets",
      "HomeTV",
      "Cameras",
      "Gaming",
      "Headphones",
      "Equipments",
      "SmartPhones"
    ],
  },
  brand: {
    type: String,
  },
  size: {
    type: String,
  },
  shipping: {
    type: {
      type: String,
      enum: ["Free", "Paid"],
    },
    cost: {
      type: Number,
      required: true,
    },
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
},{timestamps:true});

module.exports = mongoose.model("Product", productSchema);
