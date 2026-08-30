import { HouseRepository, type CreateHouseInput } from './houses.repository.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { House } from '@prisma/client';

export class HouseService {
  constructor(private houseRepo = new HouseRepository()) {}

  async createHouse(data: CreateHouseInput): Promise<House> {
    const existing = await this.houseRepo.findByInviteCode(data.invite_code);
    if (existing) {
      throw new AppError('Código de residência já em uso.', 409, 'HOUSE_CODE_ALREADY_EXISTS');
    }
    return this.houseRepo.create(data);
  }

  async getHouseById(id: string): Promise<House> {
    const house = await this.houseRepo.findById(id);
    if (!house) {
      throw new AppError('Residência não encontrada.', 404, 'HOUSE_NOT_FOUND');
    }
    return house;
  }

  async lookupHouseByCode(inviteCode: string) {
    const house = await this.houseRepo.findByInviteCode(inviteCode);
    if (!house) {
      throw new AppError('Código de residência inválido.', 404, 'HOUSE_CODE_INVALID');
    }
    return house;
  }
}
