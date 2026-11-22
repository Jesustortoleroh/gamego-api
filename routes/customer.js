import express from "express"
import * as customerController from "../controllers/customer.js"

const router = express.Router()

router.use(express.json())
router.param("id", customerController.validateCustomerId)

//GetAll
router.get("/", customerController.getAllCustomerRoute)

//GetSingle
router.get("/:id", customerController.getSingleCustomerRoute)

//Create
router.post("/",
    customerController.validateCustomer,
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
router.put("/:id", customerController.validateCustomerUpdate, customerController.updateSingleCustomerRoute
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

router.use((req, res) => res.status(404).json({ error: "Customer endpoint not found" }))

router.use((error, req, res, next) => {
    if (res.headersSent) return next(error)
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({ error: "Invalid customer request" })
    }
    if (error.status === 413) {
        return res.status(413).json({ error: "Customer request body is too large" })
    }
    if (error.status === 415) {
        return res.status(415).json({ error: "Unsupported request body encoding or charset" })
    }

    console.error("Customer request failed")
    res.status(500).json({ error: "Could not process customer request" })
})

export default router;