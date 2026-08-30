import bcrypt from 'bcryptjs';
import { RoomRepository, type RoomWithParticipants } from './rooms.repository.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { Role, Participant, Message } from '@prisma/client';
import type {
  CreateRoomDTO,
  JoinRoomDTO,
  JoinRoomByCredentialsDTO,
  SendMessageDTO,
} from './rooms.schemas.js';

export class RoomService {
  constructor(private roomRepo = new RoomRepository()) {}

  /**
   * Criação da sala com título único, senha criptografada e atribuição de ARCHITECT ao criador.
   */
  async createRoom(data: CreateRoomDTO): Promise<RoomWithParticipants> {
    if (!data.title || data.title.trim() === '') {
      throw new AppError('O título da sala é obrigatório.', 400, 'ROOM_TITLE_REQUIRED');
    }

    const trimmedTitle = data.title.trim();

    // Verificação de unicidade de título
    const existingRoom = await this.roomRepo.findByTitle(trimmedTitle);
    if (existingRoom) {
      throw new AppError('Já existe uma sala com este nome. Escolha outro nome.', 409, 'ROOM_ALREADY_EXISTS');
    }

    if (!data.password || data.password.trim().length < 4) {
      throw new AppError('A senha da sala deve ter no mínimo 4 caracteres.', 400, 'ROOM_PASSWORD_TOO_SHORT');
    }

    if (!data.creator_user_id) {
      throw new AppError('ID do usuário criador é obrigatório.', 400, 'CREATOR_ID_REQUIRED');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password.trim(), saltRounds);

    return this.roomRepo.createRoomWithArchitect({
      title: trimmedTitle,
      passwordHash,
      creatorUserId: data.creator_user_id,
      houseId: data.house_id,
    });
  }

  /**
   * Entrada cega na sala via Nome Exato + Senha (Segurança anti-enumeração).
   */
  async joinRoomByCredentials(data: JoinRoomByCredentialsDTO) {
    if (!data.title || !data.title.trim()) {
      throw new AppError('O nome da sala é obrigatório.', 400, 'ROOM_TITLE_REQUIRED');
    }

    if (!data.password) {
      throw new AppError('A senha da sala é obrigatória.', 400, 'PASSWORD_REQUIRED');
    }

    const room = await this.roomRepo.findByTitle(data.title.trim());

    // Se a sala não existir ou a senha não bater, retorna erro genérico idêntico
    if (!room) {
      throw new AppError('Credenciais da sala inválidas (sala não encontrada ou senha incorreta).', 401, 'INVALID_ROOM_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(data.password.trim(), room.password);
    if (!isMatch) {
      throw new AppError('Credenciais da sala inválidas (sala não encontrada ou senha incorreta).', 401, 'INVALID_ROOM_CREDENTIALS');
    }

    // Se já é participante, apenas retorna os detalhes da sala
    let participant = await this.roomRepo.findParticipant(room.id, data.user_id);
    if (!participant) {
      participant = await this.roomRepo.addParticipant(room.id, data.user_id, 'MEMBER');
    }

    const roomDetails = await this.roomRepo.findByIdWithDetails(room.id);
    return {
      room: roomDetails,
      participant,
    };
  }

  /**
   * Entrada na sala via ID com verificação criptográfica de senha.
   */
  async joinRoom(roomId: string, data: JoinRoomDTO): Promise<Participant> {
    const room = await this.roomRepo.findById(roomId);
    if (!room) {
      throw new AppError('Sala não encontrada.', 404, 'ROOM_NOT_FOUND');
    }

    // Verificar se o usuário já é participante
    const existing = await this.roomRepo.findParticipant(roomId, data.user_id);
    if (existing) {
      return existing;
    }

    if (!data.password) {
      throw new AppError('Senha da sala é obrigatória para entrar.', 401, 'PASSWORD_REQUIRED');
    }

    const isMatch = await bcrypt.compare(data.password.trim(), room.password);
    if (!isMatch) {
      throw new AppError('Senha da sala incorreta.', 401, 'INVALID_ROOM_PASSWORD');
    }

    return this.roomRepo.addParticipant(roomId, data.user_id, 'MEMBER');
  }

  /**
   * Promoção / alteração de cargo de um participante na sala (Poder do Arquiteto).
   */
  async updateMemberRole(
    roomId: string,
    targetUserId: string,
    requesterUserId: string,
    newRole: Role = 'ARCHITECT'
  ): Promise<Participant> {
    // Verificar se o solicitante é Arquiteto
    const requester = await this.roomRepo.findParticipant(roomId, requesterUserId);
    if (!requester || requester.role !== 'ARCHITECT') {
      throw new AppError('Apenas Arquitetos podem alterar cargos nesta sala.', 403, 'FORBIDDEN_NOT_ARCHITECT');
    }

    // Verificar se o usuário alvo pertence à sala
    const target = await this.roomRepo.findParticipant(roomId, targetUserId);
    if (!target) {
      throw new AppError('O usuário especificado não é participante desta sala.', 404, 'MEMBER_NOT_FOUND');
    }

    return this.roomRepo.updateParticipantRole(roomId, targetUserId, newRole);
  }

  /**
   * Lista exclusivamente as salas onde o usuário é participante ativo (Minhas Salas).
   */
  async listMyRooms(userId: string) {
    const rooms = await this.roomRepo.listMyRooms(userId);

    return rooms.map((room) => {
      const myMembership = room.participants.find((p) => p.user_id === userId);

      return {
        id: room.id,
        title: room.title,
        created_at: room.created_at,
        is_protected: Boolean(room.password),
        is_member: true,
        my_role: myMembership?.role ?? null,
        members_count: room._count.participants,
        messages_count: room._count.messages,
        participants: room.participants.map((p) => ({
          user_id: p.user.id,
          name: p.user.name,
          email: p.user.email,
          role: p.role,
          joined_at: p.joined_at,
        })),
      };
    });
  }

  /**
   * Listagem de salas formatada para o cliente (oculta hash de senha e expõe role do usuário).
   */
  async listRooms(houseId?: string, currentUserId?: string) {
    const rooms = await this.roomRepo.listRooms(houseId);

    return rooms.map((room) => {
      const myMembership = currentUserId
        ? room.participants.find((p) => p.user_id === currentUserId)
        : undefined;

      return {
        id: room.id,
        title: room.title,
        created_at: room.created_at,
        is_protected: Boolean(room.password),
        is_member: Boolean(myMembership),
        my_role: myMembership?.role ?? null,
        members_count: room._count.participants,
        messages_count: room._count.messages,
        participants: room.participants.map((p) => ({
          user_id: p.user.id,
          name: p.user.name,
          email: p.user.email,
          role: p.role,
          joined_at: p.joined_at,
        })),
      };
    });
  }

  /**
   * Envio de mensagem dentro de uma sala protegida.
   */
  async sendMessage(roomId: string, data: SendMessageDTO): Promise<Message> {
    const participant = await this.roomRepo.findParticipant(roomId, data.user_id);
    if (!participant) {
      throw new AppError('Você deve ser membro da sala para enviar mensagens.', 403, 'NOT_A_MEMBER');
    }

    if (!data.text || data.text.trim() === '') {
      throw new AppError('O conteúdo da mensagem não pode ser vazio.', 400, 'MESSAGE_TEXT_REQUIRED');
    }

    return this.roomRepo.createMessage(roomId, data.user_id, data.text.trim());
  }

  /**
   * Obtenção de histórico de mensagens para membros autorizados.
   */
  async getRoomMessages(roomId: string, userId: string, limit?: number) {
    const participant = await this.roomRepo.findParticipant(roomId, userId);
    if (!participant) {
      throw new AppError('Você deve ser membro da sala para ver as mensagens.', 403, 'NOT_A_MEMBER');
    }

    return this.roomRepo.getMessages(roomId, limit);
  }
}
