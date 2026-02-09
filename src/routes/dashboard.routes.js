// Rotas de dashboard

const express = require('express');
const { db } = require('../db-mysql');
const { calcYears } = require('../utils/helpers');

const router = express.Router();

router.get('/summary', async (req, res) => {
  const { month, year } = req.query;
  
  const members = await db.prepare('SELECT * FROM members').all();
  const payments = await db.prepare('SELECT * FROM payments WHERE month = ? AND year = ?').all(month, year);
  const events = await db.prepare('SELECT * FROM events WHERE is_active = 1 AND show_on_dashboard = 1').all();

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'Ativo').length;
  const newMembers = members.filter(m => {
    const joined = new Date(m.created_at);
    return joined.getMonth() + 1 === parseInt(month) && joined.getFullYear() === parseInt(year);
  }).length;

  const totalPayments = payments.reduce((sum, p) => sum + (p.value || 0), 0);
  const paidMembers = payments.length;
  const pendingMembers = activeMembers - paidMembers;

  const ageGroups = { crianca: 0, jovem: 0, adulto: 0, idoso: 0 };
  members.forEach(m => {
    const age = calcYears(m.dob);
    if (age <= 12) ageGroups.crianca++;
    else if (age <= 18) ageGroups.jovem++;
    else if (age < 60) ageGroups.adulto++;
    else ageGroups.idoso++;
  });

  const eventsSummary = events.map(e => ({
    id: e.id,
    name: e.name,
    date: e.date,
    goalValue: e.goal_value,
    costValue: e.cost_value,
    ticketQuantity: e.ticket_quantity,
    ticketValue: e.ticket_value
  }));

  res.json({
    members: { total: totalMembers, active: activeMembers, new: newMembers },
    payments: { total: totalPayments, paid: paidMembers, pending: pendingMembers },
    ageGroups,
    events: eventsSummary
  });
});

module.exports = router;
