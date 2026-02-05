const express = require('express');
const { getContracts } = require('../controllers/contractController');

const router = express.Router();

// GET /api/v1/contracts
router.get('/', getContracts);

module.exports = router;
