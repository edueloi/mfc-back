// Rotas de dashboard

const express = require('express');
const { db } = require('../db-mysql');
const { calcYears } = require('../utils/helpers');

const router = express.Router();

router.get('/summary', async (req, res) => {
  const { month, year } = req.query;
  const refMonth = `${month}/${year}`; // Formato MM/YYYY
  
  const members = await db.prepare('SELECT * FROM members').all();
  const teams = await db.prepare('SELECT * FROM teams').all();
  const payments = await db.prepare('SELECT * FROM payments WHERE reference_month = ?').all(refMonth);
  const events = await db.prepare('SELECT * FROM events WHERE is_active = 1 AND show_on_dashboard = 1').all();

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'Ativo').length;
  const newMembers = members.filter(m => {
    const joined = new Date(m.created_at);
    return joined.getMonth() + 1 === parseInt(month) && joined.getFullYear() === parseInt(year);
  }).length;

  const totalPayments = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const paidMembers = payments.length;
  const pendingMembers = activeMembers - paidMembers;

  // Contagem por faixa etária
  let children = 0, youth = 0, adult = 0, elderly = 0;
  let male = 0, female = 0;
  
  members.forEach(m => {
    const age = calcYears(m.dob);
    if (age <= 12) children++;
    else if (age <= 18) youth++;
    else if (age < 60) adult++;
    else elderly++;
    
    if (m.gender === 'Masculino') male++;
    else if (m.gender === 'Feminino') female++;
  });

  // Dados por equipe para o gráfico de barras
  const barData = teams.map(team => {
    const teamMembers = members.filter(m => m.team_id === team.id);
    const teamPayments = payments.filter(p => p.team_id === team.id);
    const paidCount = teamPayments.length;
    const pendingCount = teamMembers.filter(m => m.status === 'Ativo').length - paidCount;
    
    return {
      id: team.id,
      name: team.name,
      paid: paidCount,
      pending: pendingCount,
      total: teamMembers.length
    };
  });

  // Dados de tendência (últimos 6 meses)
  const trendData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(parseInt(year), parseInt(month) - 1 - i, 1);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const y = String(d.getFullYear());
    const ref = `${m}/${y}`;
    const monthPayments = await db.prepare('SELECT * FROM payments WHERE reference_month = ?').all(ref);
    trendData.push({
      month: `${m}/${y}`,
      value: monthPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
    });
  }

  // Dados do gráfico de pizza (distribuição por gênero)
  const pieData = [
    { name: 'Masculino', value: male },
    { name: 'Feminino', value: female }
  ];

  res.json({
    stats: {
      totalMembers,
      teamsCount: teams.length,
      activeMembers,
      children,
      youth,
      adult,
      elderly,
      male,
      female
    },
    barData,
    trendData,
    pieData
  });
});

module.exports = router;
