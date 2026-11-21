import express from "express"
import * as customerController from "../controllers/customer.js"

const router = express.Router()

//GetAll
router.get("/", customerController.getAllCustomerRoute)

//GetSingle
router.get("/:id", customerController.getSingleCustomerRoute)

//Create
router.post("/",
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
                $phone_number: "(123) 456-7890",
                $favorite_console: "GameCube",
                $shopping_cart: []
            }
    } */
)

//Update
router.put("/:id", customerController.updateSingleCustomerRoute
        /*  #swagger.parameters['body'] = {
            required: true,
            in: 'body',
            description: 'object to edit',
            schema: {
                $first_name: "",
                $last_name: "",
                $email: "",
                $address: "",
                $phone_number: "",
                $favorite_console: "",
                $shopping_cart: []
            }
    } */
)

//Delete
router.delete("/:id", customerController.deleteSingleCustomerRoute)

export default router;