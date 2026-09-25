const request = require('supertest');
const app = require('../server');

test('GET /health returns status ok', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('ok');
});

test('POST /api/medications creates a new entry', async () => {
  const res = await request(app)
    .post('/api/medications')
    .send({
      patient_name: 'Jane Doe',
      medication: 'Paracetamol',
      dosage: '500mg',
      time_of_day: 'morning',
    });

  expect(res.status).toBe(201);
  expect(res.body.patient_name).toBe('Jane Doe');
});

test('POST /api/medications rejects missing fields with 400', async () => {
  const res = await request(app)
    .post('/api/medications')
    .send({ patient_name: 'Incomplete Patient' });

  expect(res.status).toBe(400);
});

test('GET /api/medications returns a list', async () => {
  const res = await request(app).get('/api/medications');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBeGreaterThan(0);
});

test('GET /api/medications/:id returns the matching entry', async () => {
  const created = await request(app).post('/api/medications').send({
    patient_name: 'John Smith',
    medication: 'Ibuprofen',
    dosage: '200mg',
    time_of_day: 'evening',
  });

  const res = await request(app).get(`/api/medications/${created.body.id}`);
  expect(res.status).toBe(200);
  expect(res.body.id).toBe(created.body.id);
});

test('GET /api/medications/:id returns 404 for a missing id', async () => {
  const res = await request(app).get('/api/medications/999999');
  expect(res.status).toBe(404);
});

test('PUT /api/medications/:id updates an entry', async () => {
  const created = await request(app).post('/api/medications').send({
    patient_name: 'Alice',
    medication: 'Amoxicillin',
    dosage: '250mg',
    time_of_day: 'night',
  });

  const res = await request(app)
    .put(`/api/medications/${created.body.id}`)
    .send({ taken: true });

  expect(res.status).toBe(200);
  expect(res.body.taken).toBe(1);
});

test('PUT /api/medications/:id returns 404 for a missing id', async () => {
  const res = await request(app)
    .put('/api/medications/999999')
    .send({ taken: true });

  expect(res.status).toBe(404);
});

test('DELETE /api/medications/:id removes an entry', async () => {
  const created = await request(app).post('/api/medications').send({
    patient_name: 'Bob',
    medication: 'Vitamin D',
    dosage: '1000IU',
    time_of_day: 'morning',
  });

  const del = await request(app).delete(`/api/medications/${created.body.id}`);
  expect(del.status).toBe(204);

  const getRes = await request(app).get(`/api/medications/${created.body.id}`);
  expect(getRes.status).toBe(404);
});

test('DELETE /api/medications/:id returns 404 for a missing id', async () => {
  const res = await request(app).delete('/api/medications/999999');
  expect(res.status).toBe(404);
});
