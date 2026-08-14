import { Router } from "express";
import { adminAuth } from "../middlewares/adminAuth";
import {
  createResource,
  updateResource,
  deleteResource,
  listResource,
} from "../controllers/adminController";
import {
  setActiveCity,
  setActiveExperience,
  getActiveExperience,
} from "../controllers/activeCityController";

const router = Router();

// Publish experience — NO auth (dashboard can publish without token)
router.get("/active-city", getActiveExperience);
router.put("/active-city", setActiveCity);
router.post("/active-city", setActiveCity);

router.get("/active-experience", getActiveExperience);
router.put("/active-experience", setActiveExperience);
router.post("/active-experience", setActiveExperience);

// Remaining admin CRUD still requires Bearer token
router.use(adminAuth);

const resources = [
  { path: "/cities", table: "cities" },
  { path: "/categories", table: "city_categories" },
  { path: "/restaurants", table: "restaurants" },
  { path: "/greetings", table: "city_greetings" },
  { path: "/salary-messages", table: "city_salary_messages" },
  { path: "/spotlights", table: "local_spotlights" },
  { path: "/ui-labels", table: "ui_labels" },
  { path: "/trending-tags", table: "trending_tags" },
  { path: "/day-phases", table: "day_phases" },
  { path: "/salary-cycles", table: "salary_cycles" },
  { path: "/festivals", table: "festival_overlays" },
  { path: "/festival-categories", table: "festival_categories" },
  { path: "/festival-greetings", table: "festival_greetings" },
];

resources.forEach((r) => {
  router.get(r.path, listResource(r.table));
  router.post(r.path, createResource(r.table));
  router.put(`${r.path}/:id`, updateResource(r.table));
  router.patch(`${r.path}/:id`, updateResource(r.table));
  router.delete(`${r.path}/:id`, deleteResource(r.table));
});

export default router;
