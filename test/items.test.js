import assert from 'node:assert/strict';
import { once } from 'node:events';
import { describe, test } from 'node:test'; 
import express from 'express';
import { ObjectId } from 'mongodb';
import itemRoutes from '../routes/items.js';

function testCollection() {
  const documents = new Map();
  return {
    find: () => ({ toArray: async () => [...documents.values()] }),
    findOne: async ({ _id }) => documents.get(_id.toHexString()) ?? null,
    insertOne: async (item) => {
      const id = new ObjectId();
      documents.set(id.toHexString(), { ...item, _id: id });
      return { insertedId: id };
    },
    updateOne: async ({ _id }, { $set }) => {
      const key = _id.toHexString();
      const item = documents.get(key);
      if (!item) return { matchedCount: 0 };

      documents.set(key, { ...item, ...$set });
      return { matchedCount: 1 };
    },
    deleteOne: async ({ _id }) => ({
      deletedCount: Number(documents.delete(_id.toHexString())),
    }),
  };
}

async function startApp(t, items = testCollection()) {
  const app = express();
  app.locals.items = items;
  app.use('/items', itemRoutes);

  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));

  return (path, options) =>
    fetch(`http://127.0.0.1:${server.address().port}${path}`, options);
}

function json(method, payload) {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  };
}

const item = { name: 'Super Mario Bros.', price: 59.99, inStock: 10 };
const path = '/items';

// Wrap all tests in a describe block for better output grouping
describe('Item API', () => {

  test('lists, creates, retrieves, updates, and deletes an item over HTTP', async (t) => {
    const request = await startApp(t);
    assert.equal((await request(path)).status, 200);
    assert.deepEqual(await (await request(path)).json(), []);

    const created = await request(path, json('POST', {
      ...item,
      name: ' Super Mario Bros. ',
    }));
    assert.equal(created.status, 201);

    const { id } = await created.json();
    assert.match(id, /^[a-f0-9]{24}$/);
    assert.equal(created.headers.get('location'), `${path}/by-id?id=${id}`);

    const single = await request(created.headers.get('location'));
    assert.equal(single.status, 200);
    assert.deepEqual(await single.json(), { ...item, _id: id });

    const updated = { name: 'Zelda', price: 49.99, inStock: 4 };
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await request(`${path}/${id}`, json('PUT', updated));
      assert.equal(response.status, 204);
      assert.equal(await response.text(), '');
    }
    assert.deepEqual(await (await request(path)).json(), [{ ...updated, _id: id }]);

    const deleted = await request(`${path}/${id}`, { method: 'DELETE' });
    assert.equal(deleted.status, 200);
    assert.deepEqual(await deleted.json(), { message: 'Item deleted' });

    const missing = await request(created.headers.get('location'));
    assert.equal(missing.status, 404);
    assert.deepEqual(await missing.json(), { error: 'Item not found' });
  });

  test('returns 400 for invalid and missing item IDs', async (t) => {
    const request = await startApp(t);
    const cases = [
      [`${path}/by-id`],
      [`${path}/by-id?id=invalid`],
      [`${path}/by-id?id=${new ObjectId()}&id=${new ObjectId()}`],
      [`${path}/invalid`, json('PUT', item)],
      [`${path}/invalid`, { method: 'DELETE' }],
    ];

    for (const [url, options] of cases) {
      const response = await request(url, options);
      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), {
        error: 'A valid item ID is required',
      });
    }
  });

  test('returns field errors for invalid POST and PUT bodies', async (t) => {
    const request = await startApp(t);
    const created = await request(path, json('POST', item));
    const { id } = await created.json();
    const invalid = { name: ' ', price: -1, inStock: -2 };

    for (const [url, method] of [[path, 'POST'], [`${path}/${id}`, 'PUT']]) {
      const response = await request(url, json(method, invalid));
      assert.equal(response.status, 400);
      const { error, fields } = await response.json();
      assert.equal(error, 'Invalid item data');
      assert.deepEqual(Object.keys(fields), ['name', 'price', 'inStock']);
    }

    const empty = await request(path, { method: 'POST' });
    assert.equal(empty.status, 400);
    assert.deepEqual(await (await request(path)).json(), [{ ...item, _id: id }]);
  });

  test('returns JSON errors for malformed, oversized, and unsupported bodies', async (t) => {
    const request = await startApp(t);

    const malformed = await request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"name":',
    });
    assert.equal(malformed.status, 400);
    assert.deepEqual(await malformed.json(), { error: 'Invalid item request' });

    const oversized = await request(path, json('POST', {
      ...item,
      name: 'x'.repeat(110_000),
    }));
    assert.equal(oversized.status, 413);
    assert.deepEqual(await oversized.json(), {
      error: 'Item request body is too large',
    });

    const unsupported = await request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=iso-8859-1' },
      body: JSON.stringify(item),
    });
    assert.equal(unsupported.status, 415);
    assert.deepEqual(await unsupported.json(), {
      error: 'Unsupported request body encoding or charset',
    });
  });

  test('returns 404 when a valid ID is missing during update or delete', async (t) => {
    const request = await startApp(t);
    const url = `${path}/${new ObjectId()}`;

    for (const options of [json('PUT', item), { method: 'DELETE' }]) {
      const response = await request(url, options);
      assert.equal(response.status, 404);
      assert.deepEqual(await response.json(), { error: 'Item not found' });
    }
  });

  test('returns a generic JSON 500 for unexpected database failures', async (t) => {
    // Suppress expected error logs from stdout
    t.mock.method(console, 'error', () => {}); 
    
    const request = await startApp(t, {
      find: () => ({
        toArray: async () => {
          throw new Error('Internal database details');
        },
      }),
    });

    const response = await request(path);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), {
      error: 'Could not process item request',
    });
  });

});