const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product.model");
const User = require("./models/User.model");
const Address = require("./models/Address.model");

function errorMiddleware(req, res, error) {
  console.log("THIS IS THE ERROR ", error);

  res.status(500).send("There was an error!, check the console");
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then((response) =>
    console.log(`Connected to database: ${response.connections[0].name}`)
  )
  .catch((error) => console.error("ERROR CONNECTING TO THE DATABASE: ", error));

const PORT = 8000;

const app = express();

function myMiddleware(req, res, next) {
  console.log("HELLO THIS IS THE MIDDLEWARE");
  next();
}

app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Everything OK here");
});

app.get("/product", (req, res) => {
  console.log("SORT BY PRICE?", req.query.sort === "price");
  if (req.query.sort === "price") {
    Product.find()
      .sort({ price: 1 }) // sort by price
      //   .select("name") // like project name only
      .then((response) => res.json(response))
      .catch((error) => {
        next(error);
      });
  } else {
    Product.find()
      .then((response) => res.json(response))
      .catch((error) => {
        next(error);
      });
  }
});

// we can use custom middlewares in specific routes
app.get("/user", myMiddleware, async (req, res) => {
  try {
    const response = await User.find();

    res.json(response);
  } catch (error) {
    next(error);
  }
});

app.post("/user", async (req, res, next) => {
  console.log(req.body);
  const { user, address } = req.body;

  try {
    const addressResponse = await Address.create(address);
    user["address"] = addressResponse._id;

    const userResponse = await User.create(user);

    console.log(userResponse);

    res.send("Everything is fine, don't panic");
  } catch (error) {
    next(error);
  }
});

app.get("/user/:userId", async (req, res, next) => {
  const { userId } = req.params;

  try {
    const response = await User.findById(userId).populate("address"); // get the info about the address and not only the ID

    res.json(response);
  } catch (error) {
    next(error);
  }
});

app.put("/user/:userId", async (req, res, next) => {
  const { userId } = req.params;
  const { name, email, hobbies } = req.body.user;
  const { street, city, state, zip } = req.body.address;

  const updatedUser = { name, email, hobbies };
  const updatedAddress = { street, city, state, zip };

  console.log("USER ID:", userId);
  console.log("UPDATED USER:", updatedUser);

  try {
    const userResponse = await User.findByIdAndUpdate(userId, updatedUser, {
      new: true,
    });

    const addressResponse = await Address.findByIdAndUpdate(
      userResponse.address,
      updatedAddress,
      { new: true }
    );
    console.log(userResponse, addressResponse);

    res.json({ userResponse, addressResponse });
  } catch (error) {
    next(error);
  }
});

app.delete("/user/:userId", async (req, res, next) => {
  const { userId } = req.params;

  try {
    const userResponse = await User.findByIdAndDelete(userId);
    let addressResponse;

    if (userResponse.address) {
      addressResponse = await Address.findByIdAndDelete(userResponse.address);
    }

    res.json({ userResponse, addressResponse });
  } catch (error) {
    next(error);
  }
});

app.get("*", (req, res) => {
  // THIS ONE GOES LAST, IF EVERYTHING ELSE DOESN'T MATCH, WE SEND THE ERROR
  res.status(404).send("This route does not exist");
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`The server is running on port http://localhost:${PORT}`);
});
