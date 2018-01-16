const io = require('socket.io-client');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const sender = process.argv[2]||config.server;
const mountPoint = process.argv[3]||config.mountPoint;

const socket = io.connect(sender, {
    reconnection: true
});

triggerFileEvent = (eventType, fullPath, filename) => {
    if (eventType === 'change') {
        triggerChange(fullPath, filename);
    }
}

triggerChange = (fullPath, filename) => {
    socket.emit('notify:recieve', filename);
    console.log('recieve', fullPath);
    const time = new Date();
    fs.utimes(fullPath, time, time, (err) => {
        if (err) throw err;
        socket.emit('notify:success', filename);
    })
}

socket.on('fileEvent', (data) => {
    const fullPath = path.join(mountPoint, data.filename.replace(/\\/g, path.sep));
    triggerFileEvent(data.eventType, fullPath, data.filename);
})
