import SimplePeer from 'simple-peer'
import io from 'socket.io-client'
import $ from 'jquery'

var peer
var socket = io('/', {transports: ['websocket']})
navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.msGetUserMedia ||
                         navigator.mozGetUserMedia;

(function init () {
  if (window.location.pathname !== '/') {
    var initiatorId = (window.location.pathname).slice(3)
    socket.emit('signal request', initiatorId)
    navigator.getUserMedia({
      video: true,
      audio: true
    }, function (stream) {
      startRequester(initiatorId, stream)
    }, function (err) {
      navigator.getUserMedia({
        video: false,
        audio: true
      }, function (stream) {
        startRequester(initiatorId, stream)
      }, function (err) {
        console.log(err)
      })
    })
  }
})()
$('#room-button').on('click', function () {
  socket.emit('request link')
  $('#link').html('LOADING...')
  socket.on('receive link', function (link) {
    $('#link').html(link)
    socket.on('signal request', function (data) {
      navigator.getUserMedia({
        video: true,
        audio: true
      }, function (stream) {
        startInitiator(data, stream)
      }, function (err) {
        navigator.getUserMedia({
          video: false,
          audio: true
        }, function (stream) {
          startInitiator(data, stream)
        }, function (err) {
          console.log(err)
        })
      })
    })
  })
})
socket.on('invalid id', function () {
  postMessage('INVALID ID', 'SYSTEM')
})

function startRequester (targetId, myStream) {
  peer = new SimplePeer({initiator: false, trickle: true, stream: myStream})
  peer.on('signal', function (data) {
    socket.emit('send signal', {
      signal: data,
      shortId: targetId
    })
  })
  peer.on('connect', onPeerConnect)
  peer.on('stream', startStream)
  socket.on('get signal', function (data) {
    peer.signal(data)
  })
}
function startInitiator (targetId, myStream) {
  peer = new SimplePeer({initiator: true, trickle: true, stream: myStream})
  peer.on('connect', onPeerConnect)
  peer.on('signal', function (data) {
    socket.emit('send signal', {
      signal: data,
      socketId: targetId
    })
  })
  peer.on('stream', startStream)
  socket.on('get signal', function (data) {
    peer.signal(data)
  })
}
function startStream (stream) {
  var video = document.createElement('video')
  video.src = window.URL.createObjectURL(stream)
  document.querySelector('#vid-entry').appendChild(video)
  video.play()
}
function getTime () {
  return new Date(new Date().getTime()).toLocaleTimeString()
}
function postMessage (msg, sender) {
  var post = document.createElement('p')
  var entry = document.getElementById('entry')
  var meta = getTime() + '. ' + sender + ': '
  post.innerHTML = meta + msg
  entry.insertBefore(post, entry.childNodes[0])
}
function onPeerConnect () {
  postMessage('CONNECTED!', 'SYSTEM')
  enableChat()
}
function enableChat () {
  $('#chat-button').on('click', function () {
    var msg = $('#chat-form').val()
    $('#chat-form').val('')
    peer.send(msg)
    postMessage(msg, 'You')
  })
  peer.on('data', function (data) {
    postMessage(data, 'Not you')
  })
}
