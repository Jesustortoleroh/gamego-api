## 🎮 Game Go API

## Team
- Jesus Tortolero (GitHub Management, Validation)
- Casey Owens (MongoDB, Render)
- Zach Jones (Endpoints, OAuth)
- Nnanna Uko (Error Handling, Testing)

## Warehouse API

Use Node.js 20.19 or later and set `MONGODB_URI` to your MongoDB connection string in the terminal. Set `MONGODB_DB_NAME` if your database name differs from `GameGO`. Warehouse records are stored in the `warehouses` collection.

```sh
npm ci
npm test
npm start
```

Open [warehouses.rest](warehouses.rest) in VS Code with the REST Client extension and send the requests in order. The named POST request supplies the ID for the subsequent requests. Use a development database for these requests.

| Method and path | Success |
| --- | --- |
| `GET /warehouses` | `200` with a list |
| `GET /warehouses/by-id?id=<id>` | `200` with a warehouse |
| `POST /warehouses` | `201` with the new ID and a `Location` header |
| `PUT /warehouses/<id>` | `204` with an empty body |
| `DELETE /warehouses/<id>` | `200` with a confirmation |

POST and PUT require a nonempty `name` and `address` and an `employees` array. Use 24-character hexadecimal employee IDs or an empty array. Invalid data and IDs return `400`. A valid ID with no matching warehouse returns `404`. Unexpected database errors return `500`.
