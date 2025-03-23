import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { DatabaseService } from "src/database/database.service";

const AccessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1YTI2OGNjMzczNjI2YzJmNWE4ZTc4MjUyZTAxODBkMSIsIm5iZiI6MTc0MjczNDA5NS4wMjIsInN1YiI6IjY3ZTAwMzBmMzViZDI2YTdkOTRkOTgyOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.B_hvLg-LcoAnD8P7_XVlxeF4oduuiENZq3LMqkAA9cw'
const apikey = '5a268cc373626c2f5a8e78252e0180d1'

@WebSocketGateway(3002, {cors: {origin: "*"}})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server
  private activeUsers = new Map<number, string>()

  constructor(private readonly dataBaseServer: DatabaseService, private jwtService: JwtService){}

  async handleConnection(client: Socket) {
    const user = await this.validateUser(client);
    if (!user) {
      client.disconnect();
      return;
    }
  
    const dbUser = await this.dataBaseServer.user.findUnique({
      where: { id: user.id }
    });
  
    if (!dbUser) {
      client.disconnect();
      return;
    }
    this.activeUsers.set(dbUser.id, client.id);
  
    this.server.emit("user-joined", { message: `${dbUser.name} joined the chat` });
  }
  
  async handleDisconnect(client: Socket) {
    const user = await this.validateUser(client);
    if (!user) return;
  
    const dbUser = await this.dataBaseServer.user.findUnique({ where: { id: user.id } });
  
    if (dbUser) {
      console.log(`User disconnected: ${dbUser.name}`);
      this.server.emit("user-left", { message: `${dbUser.name} left the chat` });
    }
  
    this.activeUsers.delete(user.id);
  }

  @SubscribeMessage("newMessage")
  async handleNewMessage(client: Socket, rawMessage: any) {
    const sender = await this.validateUser(client);
    let message;
  
    console.log(typeof(rawMessage))
    try {
      if (typeof rawMessage === "string") {
        message = JSON.parse(rawMessage);
      } else {
        message = rawMessage;
      }
    } catch (error) {
      console.error("Failed to parse message:", error);
      client.emit("error", { message: "Invalid JSON format" });
      return;
    }
  
    if (!message.receiverId) {
      console.error("Receiver ID is missing!");
      client.emit("error", { message: "Receiver ID is required" });
      return;
    }
  
    const senderUser = await this.dataBaseServer.user.findUnique({ where: { id: sender?.id } });
  
    await this.dataBaseServer.message.create({
      data: {
        content: message.content,
        receiverId: message.receiverId,
        senderId: sender?.id as number
      }
    });
  
    const receiverSocketId = this.activeUsers.get(message.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit("reply", {
        senderId: sender?.id,
        sender: senderUser?.name,
        content: message.content
      });
    } else {
      console.log(`Receiver with ID ${message.receiverId} is not connected.`);
    }
  }
  
  private async validateUser(client: Socket): Promise<{ id: number; email: string; status: "User" | "Admin" } | null> {
    try {
  
      const token = client.handshake.query.token as string;

      if (!token) throw new UnauthorizedException("No token provided");
  
      const decoded = this.jwtService.verify(token) as { sub: number; email: string; status: "User" | "Admin" };
  
      console.log("Decoded Token:", decoded); 
  
      if (!decoded?.sub) throw new UnauthorizedException("Invalid token payload");
  
      return {
        id: decoded.sub,  
        email: decoded.email,
        status: decoded.status,
      };
    } catch (error) {
      console.error("WebSocket Auth Error:", error.message);
      client.disconnect();
      return null;
    }
  }
  
}