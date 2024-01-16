import { User } from "./UserManager";

let GLBOAL_ROOM_ID = 1;
interface Room {
  user1: User;
  user2: User;
}
export class RoomManager {
  private rooms: Map<string, Room>;
  constructor() {
    this.rooms = new Map<string, Room>();
  }
  createRoom(user1: User, user2: User) {
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

  onOffer(roomId: string, sdp: string, senderSocketId: string) {
    // console.log('this is receiber roomId',roomId);
    // console.log('this is receiber sdp',sdp);
    console.log("on Offer");
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    const receivingUser =
      room.user1.socket.id === senderSocketId ? room.user1 : room.user2;
    // console.log("user2", user2);
    receivingUser?.socket.emit("offer", {
      sdp,
      roomId,
    });
  }

  onAnswer(roomId: string, sdp: string, senderSocketId: string) {
    console.log("on Offer");
    // console.log("user1", user1);
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    const receivingUser =
      room.user1.socket.id === senderSocketId ? room.user1 : room.user2;
    receivingUser?.socket.emit("answer", {
      sdp,
      roomId,
    });
  }
  onIceCandidate(
    roomId: string,
    senderSocketId: string,
    candidate: any,
    type: "sender" | "receiver"
  ) {
    console.log("><><><><><><><>< ICE CANDIDATE");
    // console.log("roomId", roomId);
    // console.log("senderSocketId", senderSocketId);
    // console.log("candidate", candidate);
    // console.log("type", type);

    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }

    const receivingUser =
      room.user1.socket.id === senderSocketId ? room.user1 : room.user2;
    receivingUser.socket.emit("add-ice-candidate", { candidate, type });
  }

  generate() {
    return GLBOAL_ROOM_ID++;
  }
}
