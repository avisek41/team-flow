import { Router } from "express";
import {
  getCities,
  getCategories,
  getRestaurants,
  getDayPhases,
  getSalaryCycles,
  getFestivals,
  getAllData,
} from "../controllers/publicController";
import {
  getActiveCity,
  getActiveExperience,
} from "../controllers/activeCityController";

const router = Router();

router.get("/cities", getCities);
router.get("/active-city", getActiveCity);
router.get("/active-experience", getActiveExperience);
router.get("/categories", getCategories);
router.get("/restaurants", getRestaurants);
router.get("/day-phases", getDayPhases);
router.get("/salary-cycles", getSalaryCycles);
router.get("/festivals", getFestivals);
router.get("/all", getAllData);

export default router;
