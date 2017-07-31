import Peer from 'simple-peer';


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
});
