require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const {logger, logEvents} = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConn");
const mongoose = require("mongoose");
const allowedOrigins = require("./config/allowedOrigins");
const PORT = process.env.PORT || 3500;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
connectDB();

app.use(logger);

app.use(cors({
  origin: allowedOrigins,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));
app.use(express.json());

app.use(cookieParser());

app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/products", require("./routes/productRoutes"));
app.use("/cart", require("./routes/cartRoutes"));
app.use("/orders", require("./routes/orderRoutes"));

//Stripe-----------------
app.post("/create-checkout-session", async (req, res) => {
  const {products} = req.body;
   try {
    const lineItems = products.map((product) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.product.title,
          images: [product.product.images[0]],
        },
        unit_amount: Math.round(product.product.price * 100),
      },
      quantity: product.quantity,
    }));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "https://e-commerce-front-weld.vercel.app/success",
      cancel_url: "https://e-commerce-front-weld.vercel.app/cancel",
    });
    res.json({id: session.id});
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({error: "Internal Server Error"});
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, "mongoErrLog.log");
});
