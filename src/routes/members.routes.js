// Rotas de membros

const express = require('express');
const { v4: uuid } = require('uuid');
const { db } = require('../db-mysql');
const { rowToMember } = require('../models/converters');
const { nowIso, toInt } = require('../utils/helpers');

const router = express.Router();

router.get('/', async (req, res) => {
  const rows = await db.prepare('SELECT * FROM members ORDER BY name').all();
  res.json(rows.map(rowToMember));
});

router.post('/', async (req, res) => {
  try {
    const data = req.body || {};
    const id = uuid();
    const ts = nowIso();
    const stmt = await db.prepare(`
      INSERT INTO members (
        id, name, nickname, dob, rg, cpf, blood_type, gender, marital_status,
        spouse_name, spouse_cpf, marriage_date, mfc_date, phone, emergency_phone,
        status, team_id, street, number, neighborhood, zip, complement, city, state,
        condir, naturalness, father, mother, smoker, mobility_issue, health_plan, diet,
        medication, allergy, pcd, pcd_description, profession, religion, education,
        movement_roles, created_at, updated_at, is_payment_inactive
      ) VALUES (
        @id, @name, @nickname, @dob, @rg, @cpf, @bloodType, @gender, @maritalStatus,
        @spouseName, @spouseCpf, @marriageDate, @mfcDate, @phone, @emergencyPhone,
        @status, @teamId, @street, @number, @neighborhood, @zip, @complement, @city, @state,
        @condir, @naturalness, @father, @mother, @smoker, @mobilityIssue, @healthPlan, @diet,
        @medication, @allergy, @pcd, @pcdDescription, @profession, @religion, @education,
        @movementRoles, @createdAt, @updatedAt, @isPaymentInactive
      )
    `);

    await stmt.run({
      id,
      name: data.name || '',
      nickname: data.nickname || '',
      dob: data.dob || '',
      rg: data.rg || '',
      cpf: data.cpf || '',
      bloodType: data.bloodType || '',
      gender: data.gender || '',
      maritalStatus: data.maritalStatus || '',
      spouseName: data.spouseName || '',
      spouseCpf: data.spouseCpf || '',
      marriageDate: data.marriageDate || '',
      mfcDate: data.mfcDate || '',
      phone: data.phone || '',
      emergencyPhone: data.emergencyPhone || '',
      status: data.status || '',
      teamId: data.teamId || null,
      street: data.street || '',
      number: data.number || '',
      neighborhood: data.neighborhood || '',
      zip: data.zip || '',
      complement: data.complement || '',
      city: data.city || '',
      state: data.state || '',
      condir: data.condir || '',
      naturalness: data.naturalness || '',
      father: data.father || '',
      mother: data.mother || '',
      smoker: toInt(data.smoker),
      mobilityIssue: data.mobilityIssue || '',
      healthPlan: data.healthPlan || '',
      diet: data.diet || '',
      medication: data.medication || '',
      allergy: data.allergy || '',
      pcd: toInt(data.pcd),
      pcdDescription: data.pcdDescription || '',
      profession: data.profession || '',
      religion: data.religion || '',
      education: data.education || '',
      movementRoles: JSON.stringify(data.movementRoles || []),
      createdAt: ts,
      updatedAt: ts,
      isPaymentInactive: toInt(data.isPaymentInactive)
    });

    const row = await db.prepare('SELECT * FROM members WHERE id = ?').get(id);
    res.status(201).json(rowToMember(row));
  } catch (error) {
    console.error('Erro ao criar membro:', error);
    res.status(500).json({ error: 'Erro ao criar membro: ' + error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body || {};
  const ts = nowIso();
  await db.prepare(`
    UPDATE members SET
      name = @name,
      nickname = @nickname,
      dob = @dob,
      rg = @rg,
      cpf = @cpf,
      blood_type = @bloodType,
      gender = @gender,
      marital_status = @maritalStatus,
      spouse_name = @spouseName,
      spouse_cpf = @spouseCpf,
      marriage_date = @marriageDate,
      mfc_date = @mfcDate,
      phone = @phone,
      emergency_phone = @emergencyPhone,
      status = @status,
      team_id = @teamId,
      street = @street,
      number = @number,
      neighborhood = @neighborhood,
      zip = @zip,
      complement = @complement,
      city = @city,
      state = @state,
      condir = @condir,
      naturalness = @naturalness,
      father = @father,
      mother = @mother,
      smoker = @smoker,
      mobility_issue = @mobilityIssue,
      health_plan = @healthPlan,
      diet = @diet,
      medication = @medication,
      allergy = @allergy,
      pcd = @pcd,
      pcd_description = @pcdDescription,
      profession = @profession,
      religion = @religion,
      education = @education,
      movement_roles = @movementRoles,
      updated_at = @updatedAt,
      is_payment_inactive = @isPaymentInactive
    WHERE id = @id
  `).run({
    id,
    name: data.name || '',
    nickname: data.nickname || '',
    dob: data.dob || '',
    rg: data.rg || '',
    cpf: data.cpf || '',
    bloodType: data.bloodType || '',
    gender: data.gender || '',
    maritalStatus: data.maritalStatus || '',
    spouseName: data.spouseName || '',
    spouseCpf: data.spouseCpf || '',
    marriageDate: data.marriageDate || '',
    mfcDate: data.mfcDate || '',
    phone: data.phone || '',
    emergencyPhone: data.emergencyPhone || '',
    status: data.status || '',
    teamId: data.teamId || null,
    street: data.street || '',
    number: data.number || '',
    neighborhood: data.neighborhood || '',
    zip: data.zip || '',
    complement: data.complement || '',
    city: data.city || '',
    state: data.state || '',
    condir: data.condir || '',
    naturalness: data.naturalness || '',
    father: data.father || '',
    mother: data.mother || '',
    smoker: toInt(data.smoker),
    mobilityIssue: data.mobilityIssue || '',
    healthPlan: data.healthPlan || '',
    diet: data.diet || '',
    medication: data.medication || '',
    allergy: data.allergy || '',
    pcd: toInt(data.pcd),
    pcdDescription: data.pcdDescription || '',
    profession: data.profession || '',
    religion: data.religion || '',
    education: data.education || '',
    movementRoles: JSON.stringify(data.movementRoles || []),
    updatedAt: ts,
    isPaymentInactive: toInt(data.isPaymentInactive)
  });

  const row = await db.prepare('SELECT * FROM members WHERE id = ?').get(id);
  res.json(rowToMember(row));
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await db.prepare('DELETE FROM members WHERE id = ?').run(id);
  res.status(204).end();
});

module.exports = router;
