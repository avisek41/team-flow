import { Router } from 'express';
import { getUiTheme } from '../controllers/uiConfigController';

const router = Router();

router.get('/', getUiTheme);

export default router;
