const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

// POST endpoint to add items to the cart
router.route("/").get(cartController.getCartItems).post(cartController.addToCart);
router.post("/remove", cartController.removeProductFromCart); // .patch(verifyJWT, usersController.updateUser)
router.post("/reduce-quantity", cartController.reduceQuantityInCart); // .patch(verifyJWT, usersController.updateUser)
// .delete(verifyJWT, usersController.deleteUser);
module.exports = router;
