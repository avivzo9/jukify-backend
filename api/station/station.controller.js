const logger = require('../../services/logger.service')
const stationService = require('./station.service')

module.exports = {
    getStations,
    getStation,
    addStation,
    updateStation,
    deleteStation
}

async function getStations(req, res) {
    try {
        const stations = await stationService.query(req.query)
        res.send(stations)
    } catch (err) {
        logger.error('Cannot get stations', err)
        res.status(500).send({ err: 'Failed to get stations' })
    }
}


async function getStation(req, res) {
    try {
        const station = await stationService.getById(req.params.id)
        res.send(station)
    } catch (err) {
        logger.error('Cannot get station', err)
        res.status(500).send({ err: 'Failed to get station' })
    }
}

async function addStation(req, res) {
    try {
        const station = req.body
        const addedStation = await stationService.add(station)
        res.send(addedStation)

    } catch (err) {
        logger.error('Failed to add station', err)
        res.status(500).send({ err: 'Failed to add station' })
    }
}

async function updateStation(req, res) {
    try {
        const station = req.body
        const savedStation = await stationService.update(station)
        res.send(savedStation)
    } catch (err) {
        logger.error('Failed to update user', err)
        res.status(500).send({ err: 'Failed to update user' })
    }
}

async function deleteStation(req, res) {
    try {
        await stationService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete station', err)
        res.status(500).send({ err: 'Failed to delete station' })
    }
}