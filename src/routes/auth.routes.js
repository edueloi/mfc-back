// Rotas de autenticação

const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db-mysql');
const { rowToUser } = require('../models/converters');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario e senha sao obrigatorios.' });
  }

  const userRow = await db.prepare('SELECT * FROM users WHERE lower(username) = lower(?) AND active = 1').get(username);
  if (!userRow) {
    return res.status(401).json({ error: 'Credenciais invalidas.' });
  }

  const cityRow = await db.prepare('SELECT * FROM cities WHERE id = ?').get(userRow.city_id);
  if (!cityRow || !cityRow.active) {
    return res.status(403).json({ error: 'Cidade inativa. Acesso bloqueado.' });
  }

  const isValid = bcrypt.compareSync(password, userRow.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'Credenciais invalidas.' });
  }

  return res.json({ user: rowToUser(userRow) });
});

module.exports = router;
