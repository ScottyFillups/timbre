import SimplePeer from 'simple-peer';
import io from 'socket.io-client';
import $ from 'jquery';

var signalOn = false;
var peer;
var socket = io('/', {transports: ['websocket']});

(function init() {
  if (window.location.pathname !== '/') {
    startRequester();
  }
})();
$('#room-button').on('click', function() {
  socket.emit('request link');
  $('#link').html('LOADING...');
  socket.on('receive link', function(link) {
    $('#link').html(link);
    startInitiator();
  });
});
socket.on('invalid id', function() {
  postMessage('INVALID ID');
});

function startInitiator() {
  peer = new SimplePeer({initiator: true});
  socket.on('signal request', function(id) {
    peer.on('signal', function(data) {
      socket.emit('send signal', {
        signal: data,
        target: id
      });
    });
    socket.on('get signal', function(data) {
      console.log('got signal');
      peer.signal(data);
    });
  });
  peer.on('connect', onPeerConnect);
}
function startRequester() {
  var initiatorId = (window.location.pathname).slice(3);
  socket.emit('signal request', initiatorId);
  peer = new SimplePeer();

  peer.on('signal', function(data) {
    socket.emit('send signal', {
      signal: data,
      target: initiatorId
    });
  });
  socket.on('get signal', function(data) {
    console.log('got signal');
    peer.signal(data);
  });
  peer.on('connect', onPeerConnect);
}


function postMessage(msg) {
  var post = document.createElement('p');
  post.innerHTML = msg;
  document.getElementById('entry').appendChild(post);
}
function onPeerConnect() {
  postMessage('CONNECTED!');  
  enableChat();
}
function enableChat() {
  console.log('CHAT ENABLED');
  $('#chat-button').on('click', function() {
    var msg = $('#chat-form').value;
    $('#chat-form').value = '';
    peer.send(msg);
    postMessage(msg);
  });
  peer.on('data', function(data) {
    postMessage(data);
  });
}




/*
var p = new Peer({ initiator: location.hash === '#1', trickle: false });
console.log(p);
p.on('error', function (err) { console.log('error', err) });
 
p.on('signal', function (data) {
  console.log('SIGNAL', JSON.stringify(data));
  document.querySelector('#outgoing').textContent = JSON.stringify(data);
});
 
document.querySelector('#signalling').addEventListener('submit', function (ev) {
  ev.preventDefault();
  p.signal(JSON.parse(document.querySelector('#incoming').value));
});
 
p.on('connect', function () {
  console.log('CONNECT');
  p.send('whatever' + Math.random());

  document.querySelector('#chatform').addEventListener('submit', function(ev) {
    ev.preventDefault();
    p.send(document.querySelector('#chat').value);
  });
});
 
p.on('data', function (data) {
  var p = document.createElement('p');
  p.innerHTML = data;
  document.querySelector('#entry').appendChild(p);
});*/
