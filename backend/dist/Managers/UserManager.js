"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const RoomManager_1 = require("./RoomManager");
let GLBOAL_ROOM_ID = 1;
class UserManager {
    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager_1.RoomManager();
    }
    addUser(name, socket) {
        console.log("add user");
        this.users.push({ name, socket });
        this.queue.push(socket.id);
        socket.send("lobby");
        this.clearQueue();
        this.initHandler(socket);
    }
    removeUser(socketId) {
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
    initHandler(socket) {
        socket.on("offer", ({ sdp, roomId }) => {
            console.log("inside offer");
            // console.log("inside roomId", roomId);
            this.roomManager.onOffer(roomId, sdp);
        });
        socket.on("answer", ({ sdp, roomId }) => {
            console.log("inside answer");
            this.roomManager.onAnswer(roomId, sdp);
        });
        socket.on("add-ice-candidate", ({ candidate, roomId, type }) => {
            this.roomManager.onIceCandidate(roomId, socket.id, candidate, type);
        });
    }
    generate() {
        return GLBOAL_ROOM_ID++;
    }
}
exports.UserManager = UserManager;
