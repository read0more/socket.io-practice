const socket = io();
const welcome = document.getElementById("welcome");
const room = document.getElementById("room");
const form = welcome.querySelector("form");
let roomName = "";

room.hidden = true;

function showRoom () {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector('h3');
    h3.textContent = `Room name: ${roomName}`;
    const msgForm = room.querySelector('#msg');
    const nameForm = room.querySelector('#name');

    msgForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = room.querySelector('#msg input');
        const value = input.value;
        socket.emit('new_message', value, roomName, () => {
            addMessage(`You: ${value}`);
        });        
        input.value = "";
    });

    nameForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = room.querySelector('#name input');
        const value = input.value;
        socket.emit("nickname", value);
    });
}

form.addEventListener("submit", (event) =>{
    event.preventDefault();
    const input = (form.querySelector('input'));
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
})

function addMessage(message) {
    const ul = room.querySelector('ul');
    const li = document.createElement('li');
    li.innerText = message;
    ul.appendChild(li);
};

socket.on('welcome', (nickname, userCount) => {
    console.log(userCount);
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${userCount})`;
    addMessage(`${nickname} 들어왔다`);
})

socket.on('bye', (nickname, userCount) => {
    console.log(userCount);
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${userCount})`;
    addMessage(`${nickname} 나갔다`);
})

socket.on('new_message', addMessage);

socket.on('room_change', (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    rooms.forEach((room) => {
        const li = document.createElement("li");
        li.textContent = room;
        roomList.append(li);
    })
});