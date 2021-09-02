const router = require("express").Router();

// TODO: Implement the /dishes routes needed to make the tests pass
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

//Create routes to allow the user to update or read a certain dish
router
  .route("/:dishId")
  .get(controller.read)
  .put(controller.update)
  .all(methodNotAllowed);

//Create routes to allow the user to create a dish or list all of the dishes
router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

module.exports = router;
