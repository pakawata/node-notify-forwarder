const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const config = require('./config.json');

const io = require('socket.io').listen(config.port);
const watchPath = config.watchPoint;
let watchedList = [];


watchFileChange = (watchPath, callBack) => {
    if (!watchPath || typeof(watchPath) !== 'string') return;
    fs.watch(watchPath, {recursive: true}, (eventType, filename) => {
        const index = watchedList.findIndex((value) => {
            return value === filename;
        });
        
        if (index >= 0) return;

        watchedList.push(filename);
        
        const fullPath = path.join(watchPath, filename);
        if (eventType === 'change' && filename && fs.lstatSync(fullPath).isFile()) {
            if (callBack && typeof(callBack) === 'function') {
                callBack(eventType, filename);
            }
        }
    });

}

broadcastFileEvent = (eventType, filename) => {
    console.log(eventType, filename);
    io.sockets.emit('fileEvent', {eventType, filename});
}

io.on('connection', (socket) => {
    console.log('connected');

    socket.on('notify:success', (filename) => {
        const index = temp.findIndex((value) => {
            return value === filename;
        })
        temp.splice(index, 1);
    });
    
});

watchFileChange(watchPath, broadcastFileEvent);