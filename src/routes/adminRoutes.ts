import { Router } from 'express';
// import { adminAuth } from '../middlewares/adminAuth';
import { createResource, updateResource, deleteResource } from '../controllers/adminController';

const router = Router();

// router.use(adminAuth);

const resources = [
    { path: '/cities', table: 'cities' },
    { path: '/categories', table: 'city_categories' },
    { path: '/restaurants', table: 'restaurants' },
    { path: '/day-phases', table: 'day_phases' },
    { path: '/salary-cycles', table: 'salary_cycles' },
    { path: '/festivals', table: 'festival_overlays' }
];

resources.forEach(r => {
    router.post(r.path, createResource(r.table));
    router.put(`${r.path}/:id`, updateResource(r.table));
    router.patch(`${r.path}/:id`, updateResource(r.table));
    router.delete(`${r.path}/:id`, deleteResource(r.table));
});

export default router;
