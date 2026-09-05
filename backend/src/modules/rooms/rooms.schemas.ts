import type { Role } from '@prisma/client';

export interface CreateRoomDTO {
  title: string;
  password: string;
  creator_user_id: string;
  house_id?: string;
}

export interface JoinRoomDTO {
  password: string;
  user_id: string;
}

export interface SendMessageDTO {
  user_id: string;
  text: string;
}

export interface UpdateMemberRoleDTO {
  role: Role;
  requester_user_id: string;
}

export interface PromoteMemberDTO {
  targetUserId: string;
}

export interface JoinRoomByCredentialsDTO {
  title: string;
  password: string;
  user_id: string;
}
