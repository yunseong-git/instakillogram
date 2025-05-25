import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DmService } from './dm.service';
import { DmMessage } from './dto/dm-message.dto';

//프론트와 연결시 cors설정
@WebSocketGateway({
  namespace: '/dm',
  // 추후 설정 바꿔야함
  cors: {
    origin: '*',
  },
})
export class DmGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly dmService: DmService,) { }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      client.disconnect();
      return;
    }
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: any) {
    console.log('Received message:', payload);
    await this.dmService.processMessage(payload, this.server);
  }
}
