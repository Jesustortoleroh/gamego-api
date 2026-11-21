const mongoose = require("mongoose")
const Customer = require("../schema/customer")
const { ObjectId } = require("mongodb")
mongoose.connect(process.env.MONGODB_CONNECTION_STRING)

async function getAllCustomerRoute(req, res){
    try{
        const result = await Customer.find()
        console.log(result)
        res.send(result)
    } catch(err) {
        console.error(err)
    }
}

async function getSingleCustomerRoute(req, res){
    try{
        const result = await Customer.findOne({_id: new ObjectId(req.params.id)})
        console.log(result)
        res.send(result)
    } catch(err) {
        console.error(err)
    }
}

async function createSingleCustomerRoute(req, res){
    try{
        const result = await Customer.create(req.body)
        console.log(result)
        res.send(result)
    } catch(err) {
        console.error(err)
    }
}

async function updateSingleCustomerRoute(req, res){
    try{
        const result = await Customer.updateOne({_id: new ObjectId(req.params.id)}, req.body)
        console.log(result)
        res.send(result)
    } catch(err) {
        console.error(err)
    }
}

async function deleteSingleCustomerRoute(req, res){
    try{
        const result = await Customer.deleteOne({_id: new ObjectId(req.params.id)})
        console.log(result)
        res.send(result)
    } catch(err) {
        console.error(err)
    }
}

module.exports = {
    getAllCustomerRoute,
    getSingleCustomerRoute,
    createSingleCustomerRoute,
    updateSingleCustomerRoute,
    deleteSingleCustomerRoute
}