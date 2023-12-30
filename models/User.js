const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      //select: false,  Don't return password in user queries
    },
    // role: {
    //   type: String,
    //   required: true,
    //   enum: ["customer", "admin", "seller"],
    // },
    personalInfo: {
      firstName: {type: String},
      lastName: {type: String},
      address: {type: String},
      phoneNumber: {type: String},
    },
    orders: [{type: mongoose.Schema.Types.ObjectId, ref: "Order"}],
    cart: [
      {
        product: {type: mongoose.Schema.Types.ObjectId, ref: "Product"},
        quantity: {type: Number, default: 1},
      },
    ],
    wishlist: [{type: mongoose.Schema.Types.ObjectId, ref: "Product"}],
  },
  {timestamps: true},
);

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const hash = await bcrypt.hash(this.password, 10);
//   this.password = hash;
//   next();
// });

module.exports = mongoose.model("User", userSchema);
