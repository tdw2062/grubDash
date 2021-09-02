const router = require("express").Router();

// TODO: Implement the /orders routes needed to make the tests pass

// TODO: Implement the /dishes routes needed to make the tests pass
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

//Create routes to read, update, and delete a given order
router
  .route("/:orderId")
  .get(controller.read)
  .put(controller.update)
  .delete(controller.destroy)
  .all(methodNotAllowed);

//Create routes to read a given order as well as post a new order
router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

module.exports = router;
