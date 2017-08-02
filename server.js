const http = require('http');
const express = require('express');
const shortid = require('shortid');
const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);

const initiators = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/r/:initiatorId', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static('dist'));

io.set('transports', ['websocket']);
io.on('connection', (socket) => {
  socket.on('request link', () => {
    let initiatorId = shortid.generate();
    let url = 'http://localhost:8080/r/' + initiatorId;
    initiators[initiatorId] = socket;
    socket.emit('receive link', url);
  });
  socket.on('signal request', (initiatorId) => {
    let initiator = initiators[initiatorId];
    if (initiator) {
      initiator.emit('signal request', socket.id);
    } else {
      socket.emit('invalid id');
    }
  });
  socket.on('send signal', (data) => {
    io.sockets.sockets[data.target].emit('get signal', data.signal);
  });
});

server.listen(8080, function() {
  console.log('listening on port 8080');
});
