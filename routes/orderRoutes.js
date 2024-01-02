const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.route("/").get(orderController.getOrders).post(orderController.addOrder);
router.put("/:orderId", orderController.editOrderStatus);

module.exports = router;
