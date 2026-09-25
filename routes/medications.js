/**
 * routes/medications.js — Full CRUD REST routes for the `medications` resource.
 *
 *   POST   /api/medications      Create a new medication entry
 *   GET    /api/medications      Read  — list all entries
 *   GET    /api/medications/:id  Read  — get a single entry
 *   PUT    /api/medications/:id  Update an existing entry
 *   DELETE /api/medications/:id  Delete an entry
 */

const express = require('express');
const db = require('../db');

const router = express.Router();

function getStatements() {
  // Statements are prepared lazily against the *current* db module state,
  // which lets tests point DB_PATH at a throwaway file before this module
  // is required.
  return {
    insert: db.prepare(`
      INSERT INTO medications (patient_name, medication, dosage, time_of_day, taken)
      VALUES (@patient_name, @medication, @dosage, @time_of_day, @taken)
    `),
    selectAll: db.prepare('SELECT * FROM medications ORDER BY id DESC'),
    selectOne: db.prepare('SELECT * FROM medications WHERE id = ?'),
    update: db.prepare(`
      UPDATE medications
      SET patient_name = @patient_name,
          medication   = @medication,
          dosage       = @dosage,
          time_of_day  = @time_of_day,
          taken        = @taken,
          updated_at   = datetime('now')
      WHERE id = @id
    `),
    remove: db.prepare('DELETE FROM medications WHERE id = ?'),
  };
}

// ── CREATE ───────────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  const { patient_name, medication, dosage, time_of_day, taken } = req.body;

  if (!patient_name || !medication || !dosage || !time_of_day) {
    return res.status(400).json({
      error: 'patient_name, medication, dosage and time_of_day are required',
    });
  }

  const { insert, selectOne } = getStatements();
  const result = insert.run({
    patient_name,
    medication,
    dosage,
    time_of_day,
    taken: taken ? 1 : 0,
  });

  const created = selectOne.get(result.lastInsertRowid);
  res.status(201).json(created);
});

// ── READ (all) ───────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const { selectAll } = getStatements();
  res.json(selectAll.all());
});

// ── READ (one) ───────────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const { selectOne } = getStatements();
  const entry = selectOne.get(req.params.id);
  if (!entry) return res.status(404).json({ error: 'Not found' });
  res.json(entry);
});

// ── UPDATE ───────────────────────────────────────────────────────────────
router.put('/:id', (req, res) => {
  const { selectOne, update } = getStatements();
  const existing = selectOne.get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const { patient_name, medication, dosage, time_of_day, taken } = req.body;

  update.run({
    id: req.params.id,
    patient_name: patient_name ?? existing.patient_name,
    medication: medication ?? existing.medication,
    dosage: dosage ?? existing.dosage,
    time_of_day: time_of_day ?? existing.time_of_day,
    taken: taken !== undefined ? (taken ? 1 : 0) : existing.taken,
  });

  res.json(selectOne.get(req.params.id));
});

// ── DELETE ───────────────────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  const { selectOne, remove } = getStatements();
  const existing = selectOne.get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  remove.run(req.params.id);
  res.status(204).send();
});

module.exports = router;
