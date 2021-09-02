const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//Make sure that there is a deliverTo property in the request body, otherwise return an error
function bodyHasDeliverToProperty(request, response, next) {
  const { data: { deliverTo } = {} } = request.body;
  if (deliverTo && deliverTo.trim() !== "") {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a deliverTo",
  });
}

//Make sure that there is a mobileNumber property in the request body, otherwise return an error
function bodyHasMobileNumberProperty(request, response, next) {
  const { data: { mobileNumber } = {} } = request.body;
  if (mobileNumber && mobileNumber.trim() !== "") {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a mobileNumber",
  });
}

//Make sure that there is a dishes property in the request body, otherwise return an error
function bodyHasDishesProperty(request, response, next) {
  const { data: { dishes } = {} } = request.body;
  if (!dishes) {
    next({
      status: 400,
      message: "Order must include a dish",
    });
  }
  if (Array.isArray(dishes) && dishes.length !== 0) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include at least one dish",
  });
}

//Make sure that there is a quantity property in the request body, otherwise return an error
function bodyHasQuantityProperty(request, response, next) {
  const { data: { dishes } = {} } = request.body;
  //console.log(dishes);
  for (let i = 0; i < dishes.length; i++) {
    if (
      !dishes[i].quantity ||
      dishes[i].quantity < 1 ||
      !Number.isInteger(dishes[i].quantity)
    ) {
      next({
        status: 400,
        message: `Dish ${i} must have a quantity that is an integer greater than 0`,
      });
    }
  }

  return next();
}

//Make sure that the order ID matches one of the current order IDs in the array
function orderExists(req, res, next) {
  const { orderId } = req.params;

  if (orderId) {
    console.log(orderId);
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
      res.locals.order = foundOrder;
      return next();
    }
    next({
      status: 404,
      message: `Order does not exist: ${orderId}`,
    });
  }

  return next();
}

//Make sure that the order ID in the request body matches an order ID from the array, otherwise return an error
function orderIdMatches(req, res, next) {
  //from route
  const { orderId } = req.params;

  //from request body
  const { data: { id } = {} } = req.body;
  console.log(orderId, id);

  if (id) {
    if (orderId === id) {
      return next();
    }
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
    });
  }

  return next();
}

//Make sure that there is a status property in the request body, otherwise return an error
function bodyHasStatusProperty(request, response, next) {
  const order = response.locals.order;

  //Grab original status
  const originalStatus = order.status;

  const { data: { status } = {} } = request.body;

  //Check if status is null or empty
  if (!status || status.trim() === "") {
    next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  }

  //Check if status is other than prescribed values
  if (
    status !== "pending" &&
    status !== "preparing" &&
    status !== "out-for-delivery" &&
    status !== "delivered"
  ) {
    next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  }

  //Check if order has already been delivered
  if (originalStatus === "delivered") {
    next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  }

  return next();
}

//Return a given order based on the ID given
function read(req, res, next) {
  const { orderId } = req.params;

  res.json({
    data: res.locals.order,
  });
}

//Create a new order based on the info given in the request body
function create(request, response, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } =
    request.body;
  const newOrder = {
    id: nextId(), // Increment last id then assign as the current ID
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);

  response.status(201).json({ data: newOrder });
}

//Update a given order based on the information given in the request body
function update(req, res, next) {
  const order = res.locals.order;
  console.log(order);
  //Grab original variables
  const originalDeliverTo = order.deliverTo;
  const originalMobileNumber = order.mobileNumber;
  const originalStatus = order.status;
  const originalDishes = order.dishes;

  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  if (
    //If there is a difference then update
    originalDeliverTo !== deliverTo ||
    originalMobileNumber !== mobileNumber ||
    originalStatus !== status ||
    originalDishes !== dishes
  ) {
    // update the variables
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;
  }

  res.json({ data: order });
}

//List all of the orders
function list(req, res) {
  res.json({ data: orders });
}

//Delete a given order based on the ID in the url
function destroy(req, res, next) {
  const { orderId } = req.params;
  const order = res.locals.order;

  if (order.status !== "pending") {
    next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  }

  const index = orders.findIndex((order) => order.id === Number(orderId));
  // splice returns an array of the deleted elements, even if it is one element
  const deletedOrders = orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  read: [orderExists, read],
  orderExists,
  create: [
    bodyHasDeliverToProperty,
    bodyHasMobileNumberProperty,
    bodyHasDishesProperty,
    bodyHasQuantityProperty,
    create,
  ],
  update: [
    orderExists,
    orderIdMatches,
    bodyHasDeliverToProperty,
    bodyHasMobileNumberProperty,
    bodyHasDishesProperty,
    bodyHasQuantityProperty,
    bodyHasStatusProperty,
    update,
  ],
  destroy: [orderExists, destroy],
};
