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
    onOffer(roomId, sdp) {
        var _a;
        // console.log('this is receiber roomId',roomId);
        // console.log('this is receiber sdp',sdp);
        console.log("on Offer");
        const user2 = (_a = this.rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.user2;
        // console.log("user2", user2);
        user2 === null || user2 === void 0 ? void 0 : user2.socket.emit("offer", {
            sdp,
            roomId,
        });
    }
    onAnswer(roomId, sdp) {
        var _a;
        console.log("on Offer");
        const user1 = (_a = this.rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.user1;
        // console.log("user1", user1);
        user1 === null || user1 === void 0 ? void 0 : user1.socket.emit("answer", {
            sdp,
            roomId,
        });
    }
    onIceCandidate(roomId, senderSocketId, candidate, type) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketId ? room.user1 : room.user2;
        receivingUser.socket.send("add-ice-candidate", { candidate, type });
    }
    generate() {
        return GLBOAL_ROOM_ID++;
    }
}
exports.RoomManager = RoomManager;
