import type { Request, Response, NextFunction } from 'express';
import { RoomService } from './rooms.service.js';

export class RoomController {
  constructor(private roomService = new RoomService()) {}

  listRooms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const houseId = (req.query.houseId as string) || (req.headers['x-house-id'] as string);
      const currentUserId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
      const rooms = await this.roomService.listRooms(houseId, currentUserId);
      res.status(200).json({ status: 'success', data: rooms });
    } catch (error) {
      next(error);
    }
  };

  createRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const creatorUserId = (req.headers['x-user-id'] as string) || req.body.creator_user_id;
      const room = await this.roomService.createRoom({
        ...req.body,
        creator_user_id: creatorUserId,
      });
      res.status(201).json({ status: 'success', data: room });
    } catch (error) {
      next(error);
    }
  };

  joinRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roomId = String(req.params.id);
      const userId = (req.headers['x-user-id'] as string) || req.body.user_id;
      const participant = await this.roomService.joinRoom(roomId, {
        password: req.body.password,
        user_id: userId,
      });
      res.status(200).json({ status: 'success', data: participant });
    } catch (error) {
      next(error);
    }
  };

  updateMemberRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roomId = String(req.params.id);
      const targetUserId = String(req.params.userId);
      const requesterUserId = (req.headers['x-user-id'] as string) || req.body.requester_user_id;
      const role = req.body.role || 'ARCHITECT';

      const updated = await this.roomService.updateMemberRole(roomId, targetUserId, requesterUserId, role);
      res.status(200).json({ status: 'success', data: updated });
    } catch (error) {
      next(error);
    }
  };

  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roomId = String(req.params.id);
      const userId = (req.headers['x-user-id'] as string) || req.body.user_id;
      const message = await this.roomService.sendMessage(roomId, {
        user_id: userId,
        text: req.body.text,
      });
      res.status(201).json({ status: 'success', data: message });
    } catch (error) {
      next(error);
    }
  };

  getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roomId = String(req.params.id);
      const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const messages = await this.roomService.getRoomMessages(roomId, userId, limit);
      res.status(200).json({ status: 'success', data: messages });
    } catch (error) {
      next(error);
    }
  };
}
