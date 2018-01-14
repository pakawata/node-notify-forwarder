const io = require('socket.io').listen(3200);
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

const watchPath = ''; //TODO : use configuration file.
let temp = [];


watchFileChange = (watchPath, callBack) => {
    if (!watchPath || typeof(watchPath) !== 'string') return;
    fs.watch(watchPath, {recursive: true}, (eventType, filename) => {
        const index = temp.findIndex((value) => {
            return value === filename;
        });
        
        if (index >= 0) return;

        temp.push(filename);
        
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