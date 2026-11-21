const router = require("express").Router()
const customerController = require("../controllers/customer")

//GetAll
router.get("/customer", customerController.getAllCustomerRoute)

//GetSingle
router.get("/customer/:id", customerController.getSingleCustomerRoute)

//Create
router.post("/customer",
    customerController.createSingleCustomerRoute
     /*  #swagger.parameters['body'] = {
            required: true,
            in: 'body',
            description: 'object to create',
            schema: {
                $first_name: "Bob",
                $last_name: "Jones",
                $email: "bob@email.com",
                $address: "123 ABC Street, New York, NY, 12345",
                $favorite_console: "GameCube",
                $shopping_cart: []
            }
    } */
)

//Update
router.put("/customer/:id", customerController.updateSingleCustomerRoute
        /*  #swagger.parameters['body'] = {
            required: true,
            in: 'body',
            description: 'object to edit',
            schema: {
                $first_name: "",
                $last_name: "",
                $email: "",
                $address: "",
                $favorite_console: "",
                $shopping_cart: []
            }
    } */
)

//Delete
router.delete("/customer/:id", customerController.deleteSingleCustomerRoute)

module.exports = router