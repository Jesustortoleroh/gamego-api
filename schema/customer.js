const mongoose = require("mongoose")

const customerSchema = new mongoose.Schema({
  first_name: {type: String, required: true},
  last_name: {type: String, required: true},
  email: {type: String, required: true},
  address: {type: String, required: true},
  phone_number: {type: String, required: true},
  favorite_console: {type: String, required: true},
  shopping_cart: {type: Array, required: true}
})

module.exports = mongoose.model("Customer", customerSchema)