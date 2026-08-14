import { Request, Response } from "express";
import { isSupportedCityId } from "../constants/cities";
import uiService, { CityConfigMissingError } from "../services/uiService";
import { readPublishedExperience } from "../services/experienceService";

async function resolveTheme(req: Request, res: Response, forcePublished: boolean) {
  try {
    const usePublished =
      forcePublished ||
      req.query.use_published === "1" ||
      req.query.use_published === "true";

    let cityId = req.query.city_id as string | undefined;
    let overrides:
      | {
          time_context?: string;
          salary_cycle?: string;
          festival?: string;
          weather?: string;
          source?: "admin_published" | "client";
        }
      | undefined;

    if (usePublished) {
      const published = await readPublishedExperience();
      cityId = published.city_id;
      overrides = {
        time_context: published.time_context,
        salary_cycle: published.salary_cycle,
        festival: published.festival,
        weather: published.weather,
        source: "admin_published",
      };
    } else {
      overrides = {
        time_context: req.query.time_context as string | undefined,
        salary_cycle: req.query.salary_cycle as string | undefined,
        festival: req.query.festival as string | undefined,
        weather: (req.query.weather as string | undefined) || undefined,
        source: "client",
      };
    }

    if (!cityId || !cityId.trim()) {
      return res.status(400).json({
        success: false,
        code: "CITY_ID_REQUIRED",
        message: "city_id is required. No default city is applied.",
        data: null,
      });
    }

    if (!isSupportedCityId(cityId)) {
      return res.status(400).json({
        success: false,
        code: "CITY_ID_UNSUPPORTED",
        message: `Unsupported city_id '${cityId}'. Supported: ahmedabad, mumbai, odisha, delhi, bengaluru, hyderabad.`,
        data: null,
      });
    }

    const clientTime =
      (req.query.client_time as string) || new Date().toISOString();
    const dayOfMonth = req.query.day_of_month
      ? parseInt(req.query.day_of_month as string, 10)
      : new Date(clientTime).getDate();

    if (Number.isNaN(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
      return res.status(400).json({
        success: false,
        code: "INVALID_DAY_OF_MONTH",
        message: "day_of_month must be an integer from 1 to 31.",
        data: null,
      });
    }

    const themeData = await uiService.resolveUiTheme(
      cityId,
      clientTime,
      dayOfMonth,
      overrides
    );

    return res.status(200).json({
      success: true,
      message: "UI Theme resolved successfully",
      data: themeData,
    });
  } catch (error: any) {
    if (error instanceof CityConfigMissingError) {
      return res.status(error.status).json({
        success: false,
        code: error.code,
        message: error.message,
        missing: error.details,
        data: null,
      });
    }

    return res.status(500).json({
      success: false,
      code: "UI_CONFIG_ERROR",
      message: "Error resolving UI theme",
      errors: [error.message],
      data: null,
    });
  }
}

export const getUiTheme = async (req: Request, res: Response) =>
  resolveTheme(req, res, false);

/** Uses only admin-published Location + Time + Weather + Festival + Salary */
export const getPublishedUiTheme = async (req: Request, res: Response) =>
  resolveTheme(req, res, true);
