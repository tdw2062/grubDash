const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//Make sure that there is a name in the request body, otherwise return an error
function bodyHasNameProperty(request, response, next) {
  const { data: { name } = {} } = request.body;
  if (name && name.trim() !== "") {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a name",
  });
}

//Make sure that there is a description in the request body, otherwise return an error
function bodyHasDescriptionProperty(request, response, next) {
  const { data: { description } = {} } = request.body;
  if (description && description.trim() !== "") {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a description",
  });
}

//Make sure that there is an image property in the request body, otherwise return an error
function bodyHasImageProperty(request, response, next) {
  const { data: { image_url } = {} } = request.body;
  if (image_url && image_url.trim() !== "") {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a image_url",
  });
}

//Make sure that there is a price property in the request body, otherwise return an error
function bodyHasPriceProperty(request, response, next) {
  const { data: { price } = {} } = request.body;
  if (!price) {
    next({
      status: 400,
      message: "Dish must include a price",
    });
  }

  if (price > 0 && Number.isInteger(price)) {
    return next();
  }

  next({
    status: 400,
    message: "Dish must have a price that is an integer greater than 0",
  });
}

//Make sure that the dish ID matches a current dish, otherwise return an error
function dishExists(req, res, next) {
  const { dishId } = req.params;

  if (dishId) {
    console.log(dishId);
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
      res.locals.dish = foundDish;
      return next();
    }
    next({
      status: 404,
      message: `Dish does not exist: ${dishId}`,
    });
  }

  return next();
}

//Make sure that the dish ID given in the body matches the url, otherwise return an error
function dishIdMatches(req, res, next) {
  //from route
  const { dishId } = req.params;

  //from request body
  const { data: { id } = {} } = req.body;

  if (id) {
    if (dishId === id) {
      return next();
    }
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }

  return next();
}

function read(req, res, next) {
  const { dishId } = req.params;

  res.json({
    data: res.locals.dish,
  });
}

//Append the dish in the request body to the dishes array
function create(request, response, next) {
  const { data: { name, description, price, image_url } = {} } = request.body;
  const newDish = {
    id: nextId(), // Increment last id then assign as the current ID
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);

  response.status(201).json({ data: newDish });
}

//Update the dish in the array in accordance with the info given in the request body
function update(req, res, next) {
  const dish = res.locals.dish;
  console.log(dish);
  //Grab original variables
  const originalName = dish.name;
  const originalDescription = dish.description;
  const originalPrice = dish.price;
  const originalImageUrl = dish.image_url;

  const { data: { id, name, description, price, image_url } = {} } = req.body;

  if (
    originalName !== name ||
    originalDescription !== description ||
    originalPrice !== price ||
    originalImageUrl !== image_url
  ) {
    // update the variables
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
  }

  res.json({ data: dish });
}

function list(req, res) {
  res.json({ data: dishes });
}

module.exports = {
  list,
  read: [dishExists, read],
  dishExists,
  create: [
    bodyHasNameProperty,
    bodyHasDescriptionProperty,
    bodyHasImageProperty,
    bodyHasPriceProperty,
    create,
  ],
  update: [
    dishExists,
    dishIdMatches,
    bodyHasNameProperty,
    bodyHasDescriptionProperty,
    bodyHasImageProperty,
    bodyHasPriceProperty,
    update,
  ],
};
