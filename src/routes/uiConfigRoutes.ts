import { Router } from "express";
import { getUiTheme, getPublishedUiTheme } from "../controllers/uiConfigController";

const router = Router();

router.get("/published", getPublishedUiTheme);
router.get("/", getUiTheme);

export default router;
