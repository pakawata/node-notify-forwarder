const io = require('socket.io-client');
const fs = require('fs');
const path = require('path');

const mountPoint = '';

const socket = io.connect("", {
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
    // fs.readFile(filePath, 'utf8', function (err, data) {
    //     if (err) throw err;
    //     fs.writeFile (filePath, data, function(err) {
    //         if (err) throw err;
    //         console.log('success', filePath);
    //         socket.emit('notify:success', filename);
    //     });
        
    // });
}

socket.on('fileEvent', (data) => {
    const filePath = path.join(mountPoint, data.filename.replace(/\\/g, path.sep));
    triggerFileEvent(data.eventType, filePath, data.filename);
})
