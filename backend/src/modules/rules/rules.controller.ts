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
      res.status(201).json({ status: 'success', data: rule });
    } catch (err) {
      next(err);
    }
  };

  deleteRule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      await this.service.deleteRule(id);
      res.status(200).json({ status: 'success', message: 'Regra removida com sucesso.' });
    } catch (err) {
      next(err);
    }
  };
}
