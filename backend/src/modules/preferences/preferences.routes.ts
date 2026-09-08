import { Router } from 'express';
import { PreferencesController } from './preferences.controller.js';

const preferencesRoutes = Router();
const controller = new PreferencesController();

preferencesRoutes.get('/', controller.getPreferences);
preferencesRoutes.put('/', controller.updatePreferences);
preferencesRoutes.post('/', controller.updatePreferences);

export { preferencesRoutes };
