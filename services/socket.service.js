const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');

var gIo = null
var gSocketBySessionIdMap = {}

function connectSockets(http, session) {
    gIo = require('socket.io')(http);

    const sharedSession = require('express-socket.io-session');

    gIo.use(sharedSession(session, {
        autoSave: true
    }));
    gIo.on('connection', socket => {
        console.log('Someone connected')
            // console.log('New socket - socket.handshake.sessionID', socket.handshake.sessionID)
        gSocketBySessionIdMap[socket.handshake.sessionID] = socket
            // TODO: emitToUser feature - need to tested for CaJan21
            // if (socket.handshake?.session?.user) socket.join(socket.handshake.session.user._id)
        socket.on('disconnect', socket => {
            console.log('Someone disconnected')
            if (socket.handshake) {
                gSocketBySessionIdMap[socket.handshake.sessionID] = null
            }
        })
        socket.on('chat topic', topic => {
            if (socket.myTopic === topic) return;
            if (socket.myTopic) {
                socket.leave(socket.myTopic)
            }
            socket.join(topic)
                // logger.debug('Session ID is', socket.handshake.sessionID)
            socket.myTopic = topic
        })
        socket.on('chat newMsg', msg => {
            // emits to all sockets:
            // gIo.emit('chat addMsg', msg)
            // emits only to sockets in the same room
            gIo.to(socket.myTopic).emit('chat addMsg', msg)
        })
        socket.on('user-watch', userId => {
            socket.join(userId)
        })
        socket.on('station new-song', songId => {
            gIo.in(socket.myTopic).emit('station change-song', songId)
        })
        socket.on('player to-toggle-play-song', () => {
            gIo.in(socket.myTopic).emit('player toggle-play-song')
                // socket.broadcast.emit('player toggle-play-song')
        })
        socket.on('player to-next-previouse-song', (dif) => {
            gIo.in(socket.myTopic).emit('player next-previouse-song', dif)
                // socket.broadcast.emit('player next-previouse-song', dif)
        })
        socket.on('station to-change-song', (songRemove) => {
            gIo.in(socket.myTopic).emit('station remove-song', songRemove)
        })
        socket.on('station to-add-song', (payload) => {
            gIo.in(socket.myTopic).emit('station add-song', payload)
        })
        socket.on('station to-like', (addLike) => {
            gIo.in(socket.myTopic).emit('station like', addLike)
        })
        socket.on('station to-shuffleSongs', (shuffledStation) => {
            gIo.in(socket.myTopic).emit('station shuffleSongs', shuffledStation)
        })
        socket.on('station to-drag-n-drop', (newStation) => {
            gIo.in(socket.myTopic).emit('station drag-n-drop', newStation)
        })
        socket.on('player to-set-song-time', (time) => {
            socket.broadcast.emit('player set-song-time', time)
            socket.to(socket.myTopic).emit('player set-song-time', time)
            gIo.in(socket.myTopic).emit('player set-song-time', time)
        })

    })
}

function emitToAll({ type, data, room = null }) {
    if (room) gIo.to(room).emit(type, data)
    else gIo.emit(type, data)
}

// TODO: Need to test emitToUser feature
function emitToUser({ type, data, userId }) {
    gIo.to(userId).emit(type, data)
}


// Send to all sockets BUT not the current socket 
function broadcast({ type, data, room = null }) {
    const store = asyncLocalStorage.getStore()
    const { sessionId } = store
    if (!sessionId) return logger.debug('Shoudnt happen, no sessionId in asyncLocalStorage store')
    const excludedSocket = gSocketBySessionIdMap[sessionId]
    if (!excludedSocket) return logger.debug('Shouldnt happen, No socket in map')
    if (room) excludedSocket.broadcast.to(room).emit(type, data)
    else excludedSocket.broadcast.emit(type, data)
}


module.exports = {
    connectSockets,
    emitToAll,
    broadcast,
}