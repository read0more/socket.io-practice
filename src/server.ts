import http from "http";
import express from "express";
import { Server, Socket } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true
    }
});

instrument(io, {
    auth: false
})

type TWebsocket = Socket & {
  nickname?: string;
};

function publicRooms() {
  const { sids, rooms } = io.sockets.adapter;

  const publicRooms: string[] = [];
  rooms.forEach((_, key) => {
    if(sids.get(key) === undefined) {
        publicRooms.push(key);
    }
  });

  return publicRooms;
}

function countRoom(roomName: string) {
    return io.sockets.adapter.rooms.get(roomName)?.size;
}

io.on("connection", (socket: TWebsocket) => {
  socket["nickname"] = "익명";
  socket.onAny((event) => {
    console.log(``);
  });
  socket.on("enter_room", (roomName, showRoom) => {
    socket.join(roomName);
    showRoom();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    io.sockets.emit('room_change', publicRooms())
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, (countRoom(room) ?? 1) - 1)
    );    
  });

  socket.on("disconnect", () => {
    io.sockets.emit('room_change', publicRooms());
  })
  socket.on("new_message", (msg, roomName, done) => {
    socket.to(roomName).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

// const sockets: WebSocket[] = [];

// type TWebsocket = WebSocket & {
//   nickname: string;
// };

// wss.on("connection", (socket: TWebsocket) => {
//   sockets.push(socket);
//   socket["nickname"] = "익명";
//   console.log("브라우저랑 연결됨");
//   socket.on("close", () => {
//     console.log("브라우저랑 연결 해제 됨");
//   });

//   socket.on("message", (message) => {
//     const parsed = JSON.parse(message.toLocaleString());

//     switch (parsed.type) {
//       case "message":
//         sockets
//           .filter((aSocket) => aSocket !== socket)
//           .forEach((aSocket) =>
//             aSocket.send(`${socket.nickname}: ${parsed.payload}`)
//           );
//         break;
//       case "nickname":
//         socket["nickname"] = parsed.payload;
//         break;
//     }
//   });
// });

server.listen(3000, handleListen);
