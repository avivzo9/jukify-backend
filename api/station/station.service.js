const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

module.exports = {
    query,
    remove,
    add,
    getById,
    update
}

async function query(filterBy = {}) {
    try {
        filterBy.popular = (filterBy.popular === 'true') ? true : false
        const collection = await dbService.getCollection('station')
        const stations = await collection.find().toArray()
        var stationsCopy = stations;
        if (!filterBy || (!filterBy.name && !filterBy.genre && !filterBy.popular)) return stations
        if (filterBy.name) {
            stationsCopy = stations.filter(s => {
                return s.name.toLowerCase().includes(filterBy.name)
            })
        }
        if (filterBy.genre) {
            if (filterBy.genre === 'all') stationsCopy = stationsCopy;
            else {
                stationsCopy = stationsCopy.filter(s => {
                    return s.genres.includes(filterBy.genre.toLowerCase())
                })
            }
        }
        if (filterBy.popular) {
            stationsCopy = stationsCopy.sort((s1, s2) => {
                return s2.likes - s1.likes;
            })
        }
        return stationsCopy
    } catch (err) {
        logger.error('cannot find stations', err)
        throw err
    }
}

async function remove(stationId) {
    try {
        const collection = await dbService.getCollection('station')
        const query = { _id: ObjectId(stationId) }
        await collection.deleteOne(query)
    } catch (err) {
        logger.error(`cannot remove station ${stationId}`, err)
        throw err
    }
}


async function add(station) {
    try {
        const stationToAdd = {
            name: station.name,
            imgUrl: station.imgUrl,
            desc: station.desc,
            likes: station.likes,
            genres: station.genres,
            songs: [],
            msgs: station.msgs,
        }
        const collection = await dbService.getCollection('station')
        await collection.insertOne(stationToAdd)
        return stationToAdd;
    } catch (err) {
        logger.error('cannot insert station', err)
        throw err
    }
}

async function getById(stationId) {
    try {
        const collection = await dbService.getCollection('station')
        const station = await collection.findOne({ '_id': ObjectId(stationId) })
        return station
    } catch (err) {
        logger.error(`while finding user ${stationId}`, err)
        throw err
    }
}

async function update(station) {
    try {
        const likes = parseInt(station.likes)
        const stationToSave = {
            _id: ObjectId(station._id),
            name: station.name,
            desc: station.desc,
            imgUrl: station.imgUrl,
            likes: likes,
            msgs: station.msgs,
            genres: station.genres,
            songs: station.songs,
            msgs: station.msgs
        }
        const collection = await dbService.getCollection('station')
        await collection.updateOne({ '_id': stationToSave._id }, { $set: stationToSave })
        return stationToSave;
    } catch (err) {
        logger.error(`cannot update station ${station._id}`, err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    return criteria
}