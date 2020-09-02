const socket = io('http://localhost:3030');


// Create a Feathers application
const app = feathers();
var restClient = feathers.rest('http://localhost:3030')

// Configure Socket.io client services to use that socket
// app.configure(feathers.socketio(socket));
app.configure(restClient.fetch(window.fetch));

const data = app.service('emi').find().then(data=> {
    console.log(data)
})
console.log(data)
socket.emit('create', 'emi', {  text: 'A emi from a REST client'}, (error, data) => {
    console.log('Created all emis', data);
});






