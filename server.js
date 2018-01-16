const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const config = require('./config.json');

let listenPort = process.argv[2]||config.port||3200;

const io = require('socket.io').listen(listenPort);
const watchPath = process.argv[3]||config.watchPoint;
let watchedList = [];

watchFileChange = (watchPath, callBack) => {
    if (!watchPath || typeof(watchPath) !== 'string') return;
    fs.watch(watchPath, {recursive: true}, (eventType, filename) => {
        const fullPath = path.join(watchPath, filename);
        if (!filename || !fs.lstatSync(fullPath).isFile() || eventType !== 'change') {
            return;
        }

        const index = watchedList.findIndex((value) => {
            return value === filename;
        });

        if (index >= 0) return;

        watchedList.push(filename);
        
        if (callBack && typeof(callBack) === 'function') {
            callBack(eventType, filename);
        }
    });

}

broadcastFileEvent = (eventType, filename) => {
    console.log(eventType, filename);
    io.sockets.emit('fileEvent', {eventType, filename});
}

removeFromWatchedList = (filename) => {
    const index = watchedList.findIndex((value) => {
        return value === filename;
    })
    watchedList.splice(index, 1);
}

io.on('connection', (socket) => {
    console.log('connected');

    socket.on('notify:success', (filename) => {
       removeFromWatchedList(filename);
    });
    
});

watchFileChange(watchPath, broadcastFileEvent);