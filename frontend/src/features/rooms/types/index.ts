export type RoomRole = 'ARCHITECT' | 'MEMBER';

export interface RoomParticipant {
  user_id: string;
  name: string;
  email?: string;
  role: RoomRole;
  joined_at?: string;
  avatar?: string;
}

export interface RoomMessage {
  id: string;
  text: string;
  created_at: string;
  user_id: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface RoomItem {
  id: string;
  title: string;
  created_at: string;
  is_protected: boolean;
  is_member: boolean;
  my_role: RoomRole | null;
  members_count: number;
  messages_count: number;
  participants: RoomParticipant[];
}

export interface CreateRoomInput {
  title: string;
  password: string;
}

export interface JoinRoomInput {
  title: string;
  password: string;
}
