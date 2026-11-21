import mongoose from "mongoose"
import { ObjectId } from "mongodb"

//Connect to DB
mongoose.connect(process.env.MONGODB_URI)

//Schema and Model creation
const customerSchema = new mongoose.Schema({
  first_name: {type: String, required: true},
  last_name: {type: String, required: true},
  email: {type: String, required: true},
  address: {type: String, required: true},
  phone_number: {type: String, required: true},
  favorite_console: {type: String, required: true},
  shopping_cart: {type: Array, required: true}
})
const Customer = mongoose.model("Customer", customerSchema)

//Get All Customers
export async function getAllCustomerRoute(req, res){
    try{
        const result = await Customer.find()
        console.log(result)
        res.status(200).json(result);
    } catch(err) {
        console.error(err)
    }
}

//Get Single Customers
export async function getSingleCustomerRoute(req, res){
    try{
        const result = await Customer.findOne({_id: new ObjectId(req.params.id)})
        console.log(result)
        res.status(200).json(result);
    } catch(err) {
        console.error(err)
    }
}

//Create single Customer
export async function createSingleCustomerRoute(req, res){
    try{
        const result = await Customer.create(req.body)
        console.log(result)
        res.status(200).json(result);
    } catch(err) {
        console.error(err)
    }
}

//Update single Customer
export async function updateSingleCustomerRoute(req, res){
    try{
        const result = await Customer.updateOne({_id: new ObjectId(req.params.id)}, req.body)
        console.log(result)
        res.status(200).json(result);
    } catch(err) {
        console.error(err)
    }
}

//Delete single Customer
export async function deleteSingleCustomerRoute(req, res){
    try{
        const result = await Customer.deleteOne({_id: new ObjectId(req.params.id)})
        console.log(result)
        res.status(200).json(result);
    } catch(err) {
        console.error(err)
    }
}