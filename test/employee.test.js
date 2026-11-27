import assert from 'node:assert/strict';
import { once } from 'node:events';
import { describe, test } from 'node:test'; 
import { ObjectId } from 'mongodb';
import { createApp } from '../app.js';

function testCollection() {
  const documents = new Map();
  return {
    find: () => ({ toArray: async () => [...documents.values()] }),
    findOne: async ({ _id }) => documents.get(_id.toHexString()) ?? null,
    insertOne: async (employee) => {
      const id = new ObjectId();
      documents.set(id.toHexString(), { _id: id, ...employee });
      return { insertedId: id };
    },
    replaceOne: async ({ _id }, employee) => {
      const key = _id.toHexString();
      if (!documents.has(key)) return { matchedCount: 0 };

      documents.set(key, { _id, ...employee });
      return { matchedCount: 1 };
    },
    findOneAndDelete: async ({ _id }) => {
      const key = _id.toHexString();
      const employee = documents.get(key) ?? null;
      documents.delete(key);
      return employee;
    },
  };
}

function failingCollection(error) {
  return {
    find: () => ({
      toArray: async () => {
        throw error;
      },
    }),
  };
}

async function startApp(t, employees = testCollection()) {
  const server = createApp(undefined, undefined, employees).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));

  return (path, options) => fetch(`http://127.0.0.1:${server.address().port}${path}`, options);
}

function json(method, payload) {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  };
}

const employee = {
  job_title: 'Warehouse Worker',
  first_name: 'Ada',
  last_name: 'Obi',
  warehouse_assigned: new ObjectId().toHexString(),
  wage: 18.5,
  wage_type: 'Hourly',
  active: true,
};
const path = '/employees';
const invalidId = { message: 'The id is not valid. An id must be a 24 character hex string.' };

// Involve everything in a describe to group
describe('Employee API', () => {
  
  test('lists, creates, retrieves, updates, and deletes an employee over HTTP', async (t) => {
    const request = await startApp(t);
    const list = await request(path);
    assert.equal(list.status, 200);
    assert.deepEqual(await list.json(), []);

    const created = await request(path, json('POST', employee));
    assert.equal(created.status, 201);
    const { id } = await created.json();
    assert.match(id, /^[a-f0-9]{24}$/);
    assert.equal(created.headers.get('location'), `${path}/${id}`);

    const single = await request(`${path}/${id}`);
    assert.equal(single.status, 200);
    assert.deepEqual(await single.json(), { _id: id, ...employee });

    const updated = { ...employee, job_title: 'Warehouse Manager', wage: 52000, wage_type: 'Salary' };
    const response = await request(`${path}/${id}`, json('PUT', updated));
    assert.equal(response.status, 204);
    assert.equal(await response.text(), '');
    assert.deepEqual(await (await request(path)).json(), [{ _id: id, ...updated }]);

    const deleted = await request(`${path}/${id}`, { method: 'DELETE' });
    assert.equal(deleted.status, 200);
    assert.deepEqual(await deleted.json(), { _id: id, ...updated });
    assert.equal((await request(`${path}/${id}`)).status, 404);
  });

  test('saves only the employee fields, with warehouse_assigned as an ObjectId', async (t) => {
    const employees = testCollection();
    const request = await startApp(t, employees);
    const created = await request(path, json('POST', { ...employee, bonus: 5 }));
    const { id } = await created.json();

    const saved = await employees.findOne({ _id: new ObjectId(id) });
    assert.ok(saved.warehouse_assigned instanceof ObjectId);
    assert.deepEqual(Object.keys(saved), ['_id', ...Object.keys(employee)]);
  });

  test('returns 400 for invalid ids', async (t) => {
    const request = await startApp(t);
    const cases = [
      [`${path}/abc`],
      [`${path}/${'z'.repeat(24)}`],
      [`${path}/abc`, json('PUT', employee)],
      [`${path}/abc`, { method: 'DELETE' }],
      [path, json('POST', { ...employee, warehouse_assigned: 'abc' })],
      [path, json('POST', { ...employee, warehouse_assigned: undefined })],
    ];

    for (const [url, options] of cases) {
      const response = await request(url, options);
      assert.equal(response.status, 400, `${options?.method ?? 'GET'} ${url}`);
      assert.deepEqual(await response.json(), invalidId);
    }
  });

  test('returns 404 for a missing employee or an unknown employee route', async (t) => {
    const request = await startApp(t);
    const id = new ObjectId().toHexString();

    for (const options of [undefined, json('PUT', employee), { method: 'DELETE' }]) {
      const response = await request(`${path}/${id}`, options);
      assert.equal(response.status, 404);
      assert.deepEqual(await response.json(), { message: `No employee found with id ${id}` });
    }

    const route = await request(`${path}/${id}`, { method: 'PATCH' });
    assert.equal(route.status, 404);
    assert.deepEqual(await route.json(), {
      message: `PATCH ${path}/${id} is not an employee route. See /api-docs for the routes.`,
    });
  });

  test('returns a JSON 400 for a malformed body', async (t) => {
    const request = await startApp(t);
    const response = await request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"first_name": ',
    });
    assert.equal(response.status, 400);
    assert.match((await response.json()).message, /^The request body is not valid JSON\./);
  });

  test('returns 503 when the database is down and 500 for other failures', async (t) => {
    t.mock.method(console, 'error', () => {}); // Ya lo tenías, excelente.
    const down = Object.assign(new Error('Server selection timed out'), {
      name: 'MongoServerSelectionError',
    });

    const offline = await startApp(t, failingCollection(down));
    const unavailable = await offline(path);
    assert.equal(unavailable.status, 503);
    assert.deepEqual(await unavailable.json(), {
      message: 'The database is not available right now. Please try again in a minute.',
    });

    const broken = await startApp(t, failingCollection(new Error('boom')));
    const failed = await broken(path);
    assert.equal(failed.status, 500);
    assert.deepEqual(await failed.json(), {
      message: 'Something went wrong on the server. Please try again later.',
    });
  });

});