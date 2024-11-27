const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  // this is the layout using the class
  //name
  name: String, // types in Uppercase
  //price
  price: Number,
  // description
  description: String,
  //brand
  brand: String,
});

const Product = mongoose.model("Product", productSchema); // we create a model to let our app know what to look for in our DB

module.exports = Product;