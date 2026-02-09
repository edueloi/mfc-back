// Rotas de pagamentos e finanças

const express = require('express');
const { v4: uuid } = require('uuid');
const { db } = require('../db-mysql');
const { rowToEventSale, rowToPayment, rowToLedger, rowToLedgerEntity } = require('../models/converters');
const { nowIso, toInt } = require('../utils/helpers');

const router = express.Router();

// Vendas de eventos
router.get('/event-sales', async (req, res) => {
  const rows = await db.prepare('SELECT * FROM event_sales ORDER BY date DESC').all();
  res.json(rows.map(rowToEventSale));
});

router.post('/event-sales', async (req, res) => {
  const data = req.body || {};
  const id = uuid();
  const ts = nowIso();
  await db.prepare(`
    INSERT INTO event_sales (id, event_id, member_id, quantity, unit_price, total_value, date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.eventId, data.memberId, data.quantity || 1, data.unitPrice || 0, data.totalValue || 0, data.date || ts, ts);
  const row = await db.prepare('SELECT * FROM event_sales WHERE id = ?').get(id);
  res.status(201).json(rowToEventSale(row));
});

// Pagamentos de mensalidade
router.get('/payments', async (req, res) => {
  const rows = await db.prepare('SELECT * FROM payments ORDER BY year DESC, month DESC').all();
  res.json(rows.map(rowToPayment));
});

router.post('/payments', async (req, res) => {
  const data = req.body || {};
  const id = uuid();
  const ts = nowIso();
  await db.prepare(`
    INSERT INTO payments (id, member_id, month, year, value, payment_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.memberId, data.month, data.year, data.value || 0, data.paymentDate || ts, ts);
  const row = await db.prepare('SELECT * FROM payments WHERE id = ?').get(id);
  res.status(201).json(rowToPayment(row));
});

// Livro-caixa (ledger)
router.get('/ledger', async (req, res) => {
  const rows = await db.prepare('SELECT * FROM ledger ORDER BY date DESC').all();
  res.json(rows.map(rowToLedger));
});

router.post('/ledger', async (req, res) => {
  const data = req.body || {};
  const id = uuid();
  const ts = nowIso();
  await db.prepare(`
    INSERT INTO ledger (id, description, value, type, category, entity_id, event_id, date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.description || '',
    data.value || 0,
    data.type,
    data.category || '',
    data.entityId || null,
    data.eventId || null,
    data.date || ts,
    ts
  );
  const row = await db.prepare('SELECT * FROM ledger WHERE id = ?').get(id);
  res.status(201).json(rowToLedger(row));
});

// Entidades do livro-caixa
router.get('/ledger-entities', async (req, res) => {
  const rows = await db.prepare('SELECT * FROM ledger_entities ORDER BY name').all();
  res.json(rows.map(rowToLedgerEntity));
});

router.post('/ledger-entities', async (req, res) => {
  const data = req.body || {};
  if (!data.name || !data.type) return res.status(400).json({ error: 'Dados obrigatorios.' });
  const id = uuid();
  const ts = nowIso();
  await db.prepare('INSERT INTO ledger_entities (id, name, type, created_at) VALUES (?, ?, ?, ?)')
    .run(id, data.name, data.type, ts);
  const row = await db.prepare('SELECT * FROM ledger_entities WHERE id = ?').get(id);
  res.status(201).json(rowToLedgerEntity(row));
});

router.put('/ledger-entities/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body || {};
  await db.prepare('UPDATE ledger_entities SET name = ?, type = ? WHERE id = ?')
    .run(data.name, data.type, id);
  const row = await db.prepare('SELECT * FROM ledger_entities WHERE id = ?').get(id);
  res.json(rowToLedgerEntity(row));
});

router.delete('/ledger-entities/:id', async (req, res) => {
  const { id } = req.params;
  await db.prepare('DELETE FROM ledger_entities WHERE id = ?').run(id);
  res.status(204).end();
});

module.exports = router;
