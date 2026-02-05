const express = require('express');
const carsRoutes = require('./cars.routes');
const bookingsRoutes = require('./bookings.routes');
const contractsRoutes = require('./contracts.routes');
const authsRoutes = require('./auths.routes');
const usersRoutes = require('./users.routes');

const router = express.Router();

router.use('/auth', authsRoutes);
router.use('/users', usersRoutes);
router.use('/cars', carsRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/contracts', contractsRoutes);

module.exports = router;
