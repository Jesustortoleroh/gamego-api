import { ObjectId } from "mongodb"

const CUSTOMER_FIELDS = [
    "first_name",
    "last_name",
    "email",
    "address",
    "phone_number",
    "favorite_console",
    "shopping_cart",
]

function customerFields(body, { required = false } = {}) {
    const fields = {}
    const customer = {}
    const input = body && typeof body === "object" && !Array.isArray(body) ? body : {}

    for (const field of CUSTOMER_FIELDS) {
        const value = input[field]
        if (value === undefined && !required) continue

        const valid = field === "shopping_cart"
            ? Array.isArray(value)
            : typeof value === "string" && value.trim().length > 0

        if (!valid) {
            fields[field] = field === "shopping_cart"
                ? "Provide an array"
                : "Provide a non-empty string"
        } else {
            customer[field] = value
        }
    }

    return { customer, fields }
}

export function validateCustomerId(req, res, next, id) {
    if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
        return res.status(400).json({ error: "A valid customer ID is required" })
    }

    res.locals.customerId = new ObjectId(id)
    next()
}

function validate(req, res, next, required) {
    const { customer, fields } = customerFields(req.body, { required })
    if (Object.keys(fields).length) {
        return res.status(400).json({ error: "Invalid customer data", fields })
    }
    if (!Object.keys(customer).length) {
        return res.status(400).json({ error: "Invalid customer data", fields: { body: "Provide customer fields" } })
    }

    res.locals.customer = customer
    next()
}

export function validateCustomer(req, res, next) {
    return validate(req, res, next, true)
}

export function validateCustomerUpdate(req, res, next) {
    return validate(req, res, next, false)
}

export async function getAllCustomerRoute(req, res) {
    const customers = await req.app.locals.customers.find().toArray()
    res.status(200).json(customers)
}

export async function getSingleCustomerRoute(req, res) {
    const customer = await req.app.locals.customers.findOne({ _id: res.locals.customerId })
    if (!customer) return res.status(404).json({ error: "Customer not found" })

    res.status(200).json(customer)
}

export async function createSingleCustomerRoute(req, res) {
    const customer = res.locals.customer
    const { insertedId } = await req.app.locals.customers.insertOne(customer)
    res.status(201).location(`/customers/${insertedId}`).json({ id: insertedId })
}

export async function updateSingleCustomerRoute(req, res) {
    const result = await req.app.locals.customers.updateOne(
        { _id: res.locals.customerId },
        { $set: res.locals.customer },
    )
    if (!result.matchedCount) return res.status(404).json({ error: "Customer not found" })

    res.status(204).end()
}

export async function deleteSingleCustomerRoute(req, res) {
    const result = await req.app.locals.customers.deleteOne({ _id: res.locals.customerId })
    if (!result.deletedCount) return res.status(404).json({ error: "Customer not found" })

    res.status(200).json({ message: "Customer deleted" })
}
