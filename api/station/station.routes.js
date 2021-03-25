const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { updateStation, addStation, getStation, getStations, deleteStation } = require('./station.controller')

const router = express.Router()

router.get('/', log, getStations)
router.get('/:id', log, getStation)
router.post('/', addStation)
router.put('/:id', updateStation)
    // router.post('/', requireAuth, addStation)
router.delete('/:id', deleteStation)
    // router.delete('/:id', requireAuth, deleteStation)

module.exports = router