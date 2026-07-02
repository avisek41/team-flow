import { Router } from 'express';
import {
    getCities,
    getCategories,
    getRestaurants,
    getDayPhases,
    getSalaryCycles,
    getFestivals,
    getAllData
} from '../controllers/publicController';

const router = Router();

router.get('/cities', getCities);
router.get('/categories', getCategories);
router.get('/restaurants', getRestaurants);
router.get('/day-phases', getDayPhases);
router.get('/salary-cycles', getSalaryCycles);
router.get('/festivals', getFestivals);
router.get('/all', getAllData);

export default router;
