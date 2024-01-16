import { Socket } from "socket.io";
import { RoomManager } from "./RoomManager";

let GLBOAL_ROOM_ID = 1;

export interface User {
  socket: Socket;
  name: string;
}

export class UserManager {
  private users: User[];
  private queue: string[];
  private roomManager: RoomManager;
  constructor() {
    this.users = [];
    this.queue = [];
    this.roomManager = new RoomManager();
  }

  addUser(name: string, socket: Socket) {
    console.log("add user");

    this.users.push({ name, socket });

    this.queue.push(socket.id);
    socket.send("lobby");
    this.clearQueue();
    this.initHandler(socket);
  }
  removeUser(socketId: string) {
    const user = this.users.filter((u) => u.socket.id === socketId);
    this.users = this.users.filter((u) => u.socket.id !== socketId);
    this.queue = this.queue.filter((q) => q === socketId);
    // user.
  }

  clearQueue() {
    console.log("clear que");
    // console.log("queue ", this.queue);
    // console.log("user ", this.users);

    // console.log("queue length", this.queue.length);

    if (this.queue.length < 2) {
      return;
    }
    const id1 = this.queue.pop();
    const id2 = this.queue.pop();
    const user1 = this.users.find((x) => x.socket.id === id1);
    const user2 = this.users.find((x) => x.socket.id === id2);
    // sdp exchange

    if (!user1 || !user2) {
      return;
    }
    // console.log("creating room bro");
    const room = this.roomManager.createRoom(user1, user2);
    this.clearQueue();
  }

  initHandler(socket: Socket) {
    socket.on("offer", ({ sdp, roomId }: { sdp: string; roomId: string }) => {
      console.log("inside offer");
      // console.log("inside roomId", roomId);
      this.roomManager.onOffer(roomId, sdp,socket.id);
    });

    socket.on("answer", ({ sdp, roomId }: { sdp: string; roomId: string }) => {
      console.log("inside answer");
      this.roomManager.onAnswer(roomId, sdp,socket.id);
    });

    socket.on("add-ice-candidate", ({ candidate, roomId,type }) => {
      this.roomManager.onIceCandidate(roomId, socket.id, candidate,type);
    });
  }
  generate() {
    return GLBOAL_ROOM_ID++;
  }
}
