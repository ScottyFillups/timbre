import SimplePeer from 'simple-peer';
import io from 'socket.io-client';
import $ from 'jquery';

var signalOn = false;
var peer;
var socket = io('/', {transports: ['websocket']});

(function init() {
  if (window.location.pathname !== '/') {
    var initiatorId = (window.location.pathname).slice(3);
    socket.emit('signal request', initiatorId);
    startRequester(initiatorId);
  }
})();
$('#room-button').on('click', function() {
  socket.emit('request link');
  $('#link').html('LOADING...');
  socket.on('receive link', function(link) {
    $('#link').html(link);
    socket.on('signal request', startInitiator);
  });
});
socket.on('invalid id', function() {
  postMessage('INVALID ID');
});

function startRequester(targetId) {
  peer = new SimplePeer({initiator: false, trickle: true});
  peer.on('signal', function(data) {
    socket.emit('send signal', {
      signal: data,
      shortId: targetId
    });
  });
  peer.on('connect', onPeerConnect);
  socket.on('get signal', function(data) {
    peer.signal(data);
  });
}
function startInitiator(targetId) {
  peer = new SimplePeer({initiator: true, trickle: true});
  peer.on('connect', onPeerConnect);
  peer.on('signal', function(data) {
    socket.emit('send signal', {
      signal: data,
      socketId: targetId
    });
  });
  socket.on('get signal', function(data) {
    peer.signal(data);
  });
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
  $('#chat-button').on('click', function() {
    var msg = $('#chat-form').val();
    $('#chat-form').val('');
    peer.send(msg);
    postMessage(msg);
  });
  peer.on('data', function(data) {
    postMessage(data);
  });
}
