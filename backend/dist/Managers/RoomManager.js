"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
let GLBOAL_ROOM_ID = 1;
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(user1, user2) {
        const roomId = this.generate().toString();
        // console.log("roomId", roomId);
        this.rooms.set(roomId.toString(), {
            user1,
            user2,
        });
        user1.socket.emit("send-offer", {
            roomId,
        });
    }
    onOffer(roomId, sdp, senderSocketId) {
        // console.log('this is receiber roomId',roomId);
        // console.log('this is receiber sdp',sdp);
        console.log("on Offer");
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketId ? room.user1 : room.user2;
        // console.log("user2", user2);
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("offer", {
            sdp,
            roomId,
        });
    }
    onAnswer(roomId, sdp, senderSocketId) {
        console.log("on Offer");
        // console.log("user1", user1);
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketId ? room.user1 : room.user2;
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("answer", {
            sdp,
            roomId,
        });
    }
    onIceCandidate(roomId, senderSocketId, candidate, type) {
        console.log("><><><><><><><>< ICE CANDIDATE");
        // console.log("roomId", roomId);
        // console.log("senderSocketId", senderSocketId);
        // console.log("candidate", candidate);
        // console.log("type", type);
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketId ? room.user1 : room.user2;
        receivingUser.socket.emit("add-ice-candidate", { candidate, type });
    }
    generate() {
        return GLBOAL_ROOM_ID++;
    }
}
exports.RoomManager = RoomManager;
