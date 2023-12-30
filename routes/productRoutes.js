const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const verifyJWT = require("../middleware/verifyJWT");

router
  .route("/")
  .get(productController.getProducts)
  .post(productController.createProduct)
  
  router.route('/wishlist').get(productController.getWishlist).put(productController.toggleFavorite);
router.route("/details/:category").get(productController.getProductsCategories);
// .patch(verifyJWT,productController.updateUser)
// .delete(verifyJWT,productController.deleteUser)

module.exports = router;
