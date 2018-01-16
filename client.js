const io = require('socket.io-client');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const mountPoint = config.mountPoint;

const socket = io.connect(config.server, {
    reconnection: true
});

triggerFileEvent = (eventType, filePath, filename) => {
    if (eventType === 'change') {
        triggerChange(filePath, filename);
    }
}

triggerChange = (filePath, filename) => {
    socket.emit('notify:recieve', filename);
    console.log('recieve', filePath);
    const time = new Date();
    fs.utimes(filePath, time, time, (err) => {
        if (err) throw err;
        socket.emit('notify:success', filename);
    })
}

socket.on('fileEvent', (data) => {
    const filePath = path.join(mountPoint, data.filename.replace(/\\/g, path.sep));
    triggerFileEvent(data.eventType, filePath, data.filename);
})
