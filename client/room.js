import angular from 'angular'
import io from 'socket.io-client'
import SimplePeer from 'simple-peer'
import Promise from 'bluebird'

var app = angular.module('room', [])
app.value('roomId', window.location.pathname)
app.value('streamConstraints', {
  default: { audio: true, video: true },
  audio: { audio: true, video: false },
  video: { audio: false, video: true }
})
app.factory('streamPromise', ['streamConstraints', function (streamConstraints) {
  return getStreamPromise(streamConstraints.default)
    .catch(function (err) {
      return getStreamPromise(streamConstraints.video)
    })
}])
app.controller('RoomCtrl', ['$scope', 'streamPromise', 'roomId', '$filter', function ($scope, streamPromise, roomId, $filter) {
  var selfPeer
  var isInitiator
  var myStream
  var socket
  
  streamPromise.then(function (stream) {
    myStream = stream
  })
  Promise.all([streamPromise]).then(function () {
    socket = io(roomId)
    socket.on('room full', function () {
      console.log('room is full')
    })
    socket.on('get initiator', function (isInitiator) {
      selfPeer = getSimplePeer(isInitiator, myStream)
      socket.on('p2p signal', function (signal) {
        console.log('getting signal')
        selfPeer.signal(signal)
      })
      selfPeer.on('signal', function (signal) {
        console.log('sending signal')
        socket.emit('p2p signal', signal)
      })
      selfPeer.on('stream', startStream)
      selfPeer.on('connect', onConnect)
    })
  })
}])

function getStreamPromise (constraints) {
  return Promise.resolve(navigator.mediaDevices.getUserMedia(constraints))
}
function getSimplePeer (isInitiator, stream) {
  return new SimplePeer({
    initiator: isInitiator,
    trickle: true,
    stream: stream
  })
}
function startStream (stream) {
  var video = document.createElement('video')
  video.src = window.URL.createObjectURL(stream)
  document.body.appendChild(video)
  video.play()
}
function onConnect () {
  console.log('Connected!')
}
