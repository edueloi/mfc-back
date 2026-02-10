// Rotas de configurações financeiras

const express = require('express');
const { db } = require('../db-mysql');

const router = express.Router();

// GET - Buscar configurações financeiras
router.get('/', async (req, res) => {
  try {
    const rows = await db.prepare('SELECT * FROM financial_config WHERE id = 1').all();
    
    if (rows.length === 0) {
      // Se não existe, criar com valores padrão
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      await db.prepare(
        'INSERT INTO financial_config (id, monthly_payment_amount, event_ticket_default_value, currency, updated_at) VALUES (1, 50.00, 100.00, ?, ?)'
      ).run('BRL', now);
      
      return res.json({
        monthlyPaymentAmount: 50.00,
        eventTicketDefaultValue: 100.00,
        currency: 'BRL'
      });
    }

    const config = rows[0];
    res.json({
      monthlyPaymentAmount: config.monthly_payment_amount,
      eventTicketDefaultValue: config.event_ticket_default_value,
      currency: config.currency
    });
  } catch (error) {
    console.error('Erro ao buscar configurações financeiras:', error);
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

// PUT - Atualizar configurações financeiras
router.put('/', async (req, res) => {
  try {
    const { monthlyPaymentAmount, eventTicketDefaultValue, currency } = req.body;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    await db.prepare(
      'UPDATE financial_config SET monthly_payment_amount = ?, event_ticket_default_value = ?, currency = ?, updated_at = ? WHERE id = 1'
    ).run(monthlyPaymentAmount, eventTicketDefaultValue, currency || 'BRL', now);

    res.json({
      monthlyPaymentAmount,
      eventTicketDefaultValue,
      currency: currency || 'BRL'
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações financeiras:', error);
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
});

module.exports = router;
