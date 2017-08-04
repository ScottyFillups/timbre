const http = require('http');
const express = require('express');
const shortid = require('shortid');
const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);

const WEBSERVER_PORT = process.env.PORT || 8080;
const PRODUCTION = process.env.PORT;

let ROOT_URL;

const initiators = {};

if (PRODUCTION) {
  app.get('*', (req, res, next) => {
    if (req.headers['x-forwarded-proto'] != 'https') {
      res.redirect('https://' + req.get('host') + req.url);
    } else {
      next();
    }
  });
}
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  if (!ROOT_URL) {
    ROOT_URL = req.get('host');
  }
});
app.get('/r/:initiatorId', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/dist', {redirect: false}));

io.set('transports', ['websocket']);
io.on('connection', (socket) => {
  socket.on('request link', () => {
    let initiatorId = shortid.generate();
    let url = 'https://' + ROOT_URL + '/r/' + initiatorId;
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
    if (data.socketId) {
      io.sockets.sockets[data.socketId].emit('get signal', data.signal);
    }
    else if (data.shortId) {
      initiators[data.shortId].emit('get signal', data.signal);
    }
  });
});

server.listen(WEBSERVER_PORT, function() {
  console.log('listening on port ' + WEBSERVER_PORT);
});
