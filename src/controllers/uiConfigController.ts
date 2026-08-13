import { Request, Response } from "express";
import { isSupportedCityId } from "../constants/cities";
import uiService, { CityConfigMissingError } from "../services/uiService";

export const getUiTheme = async (req: Request, res: Response) => {
  try {
    const cityId = req.query.city_id as string | undefined;

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
      dayOfMonth
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
};
