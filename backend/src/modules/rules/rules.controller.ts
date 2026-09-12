import type { Request, Response, NextFunction } from 'express';
import { RulesService } from './rules.service.js';

export class RulesController {
  constructor(private service = new RulesService()) {}

  getRules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const houseId = (req.query.houseId as string) || (req.headers['x-house-id'] as string);
      const rules = await this.service.getHouseRules(houseId);
      res.status(200).json({ status: 'success', data: rules });
    } catch (err) {
      next(err);
    }
  };

  createRule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const houseId = req.body.house_id || (req.headers['x-house-id'] as string);
      const { title, description, number } = req.body;
      const rule = await this.service.createRule(houseId, title, description, number);

      if (houseId) {
        try {
          const { emitToHouse } = await import('../../shared/socket/socketServer.js');
          emitToHouse(houseId, 'house:rule_created', rule);
        } catch {}
      }

      res.status(201).json({ status: 'success', data: rule });
    } catch (err) {
      next(err);
    }
  };

  deleteRule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const houseId = req.body?.house_id || (req.headers['x-house-id'] as string) || (req.query.houseId as string);
      await this.service.deleteRule(id);

      if (houseId) {
        try {
          const { emitToHouse } = await import('../../shared/socket/socketServer.js');
          emitToHouse(houseId, 'house:rule_deleted', { ruleId: id });
        } catch {}
      }

      res.status(200).json({ status: 'success', message: 'Regra removida com sucesso.' });
    } catch (err) {
      next(err);
    }
  };
}
