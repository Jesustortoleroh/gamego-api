import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import { ObjectId } from "mongodb";
import { createApp } from "../app.js";

function testCollection() {
    const documents = new Map()
    return {
        find: () => ({ toArray: async () => [...documents.values()] }),
        findOne: async ({ _id }) => documents.get(_id.toHexString()) ?? null,
        insertOne: async (customer) => {
            const id = new ObjectId()
            documents.set(id.toHexString(), { ...customer, _id: id })
            return { insertedId: id }
        },
        updateOne: async ({ _id }, { $set }) => {
            const key = _id.toHexString()
            const customer = documents.get(key)
            if (!customer) return { matchedCount: 0 }

            documents.set(key, { ...customer, ...$set })
            return { matchedCount: 1 }
        },
        deleteOne: async ({ _id }) => ({
            deletedCount: Number(documents.delete(_id.toHexString())),
        }),
    }
}

async function startApp(t, customers = testCollection()) {
    const server = createApp(undefined, undefined, undefined, customers).listen(0, "127.0.0.1")
    await once(server, "listening")
    t.after(() => new Promise((resolve) => server.close(resolve)))

    return (path, options) => fetch(`http://127.0.0.1:${server.address().port}${path}`, options)
}

function json(method, payload) {
    return {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    }
}

const customer = {
    first_name: "Ada",
    last_name: "Lovelace",
    email: "ada@example.com",
    address: "100 Main St",
    phone_number: "555-0100",
    favorite_console: "GameCube",
    shopping_cart: [],
}
const path = "/customers"

test("lists, creates, retrieves, updates, and deletes a customer over HTTP", async (t) => {
    const request = await startApp(t)
    const list = await request(path)
    assert.equal(list.status, 200)
    assert.deepEqual(await list.json(), [])

    const created = await request(path, json("POST", customer))
    assert.equal(created.status, 201)
    const { id } = await created.json()
    assert.match(id, /^[a-f0-9]{24}$/)
    assert.equal(created.headers.get("location"), `${path}/${id}`)

    const single = await request(`${path}/${id}`)
    assert.equal(single.status, 200)
    assert.deepEqual(await single.json(), { _id: id, ...customer })

    const updated = await request(`${path}/${id}`, json("PUT", { first_name: "Augusta" }))
    assert.equal(updated.status, 204)
    assert.equal(await updated.text(), "")
    assert.deepEqual(await (await request(`${path}/${id}`)).json(), {
        _id: id,
        ...customer,
        first_name: "Augusta",
    })

    const deleted = await request(`${path}/${id}`, { method: "DELETE" })
    assert.equal(deleted.status, 200)
    assert.deepEqual(await deleted.json(), { message: "Customer deleted" })
    assert.equal((await request(`${path}/${id}`)).status, 404)
})

test("returns JSON validation errors for invalid customer IDs and bodies", async (t) => {
    const request = await startApp(t)

    const invalidId = await request(`${path}/invalid`)
    assert.equal(invalidId.status, 400)
    assert.deepEqual(await invalidId.json(), { error: "A valid customer ID is required" })

    const invalidCreate = await request(path, json("POST", { ...customer, email: "" }))
    assert.equal(invalidCreate.status, 400)
    assert.deepEqual(await invalidCreate.json(), {
        error: "Invalid customer data",
        fields: { email: "Provide a non-empty string" },
    })

    const invalidUpdate = await request(`${path}/${new ObjectId()}`, json("PUT", {}))
    assert.equal(invalidUpdate.status, 400)
    assert.deepEqual(await invalidUpdate.json(), {
        error: "Invalid customer data",
        fields: { body: "Provide customer fields" },
    })
})

test("returns a JSON 400 for malformed customer JSON", async (t) => {
    const request = await startApp(t)
    const response = await request(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: '{"first_name": ',
    })

    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), { error: "Invalid customer request" })
})

test("returns a generic JSON 500 for customer database failures", async (t) => {
    t.mock.method(console, "error", () => {})
    const request = await startApp(t, {
        find: () => ({
            toArray: async () => {
                throw new Error("Internal database details")
            },
        }),
    })

    const response = await request(path)
    assert.equal(response.status, 500)
    assert.deepEqual(await response.json(), { error: "Could not process customer request" })
})
