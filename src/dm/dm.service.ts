import { Injectable } from '@nestjs/common';
import { RedisDmService } from 'src/redis/service/redis-dm.service'; // 경로는 실제 위치에 맞게 수정
import { DmMessage } from './dto/dm-message.dto';
import { Server } from 'socket.io';

@Injectable()
export class DmService {
  constructor(private readonly redisDmService: RedisDmService) { }

  /** 방 이름 만들기 (user1, user2 정렬 후 고정된 roomId 생성) */
  private makeRoomId(user1: string, user2: string): string {
    const [a, b] = [user1, user2].sort();
    return `room:${a}:${b}`;
  }

  /** DM 저장 (방이 없으면 생성 + 메시지 저장 + TTL 설정) */
  async processMessage(message: DmMessage, server: Server) {
    const roomId = this.makeRoomId(message.senderId, message.receiverId);

    const exists = await this.redisDmService.roomExists(roomId);
    const result = await this.redisDmService.pushMessageToRedis(roomId, JSON.stringify(message));

    // 방이 처음 만들어진 경우에만 TTL 설정 (1일)
    if (!exists) {
      await this.redisDmService.expireRoom(roomId, 60 * 60 * 24); // 1일
    }

    // 최근 50개 유지
    await this.redisDmService.trimRoomMessages(roomId, 50);

    server.to(message.receiverId).emit('receiveMessage', message);
    return result;
  }
}