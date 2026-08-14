import { Request, Response } from "express";
import supabase from "../config/supabase";
import { isSupportedCityId } from "../constants/cities";
import {
  ACTIVE_CITY_KEY,
  ACTIVE_EXPERIENCE_KEY,
  isFestivalOverrideId,
  isSalaryCycleId,
  isTimeContextId,
  isWeatherId,
  toPublicExperience,
  type PublishedExperience,
} from "../constants/experience";
import { readPublishedExperience } from "../services/experienceService";

export const getActiveExperience = async (_req: Request, res: Response) => {
  try {
    const active = await readPublishedExperience();

    const { data: city } = await supabase
      .from("cities")
      .select("image_url")
      .eq("id", active.city_id)
      .maybeSingle();

    return res.status(200).json({
      success: true,
      data: toPublicExperience(active, { image_url: city?.image_url ?? null }),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

/** @deprecated alias — returns full experience */
export const getActiveCity = getActiveExperience;

export const setActiveExperience = async (req: Request, res: Response) => {
  try {
    const cityId = req.body?.city_id as string | undefined;
    const timeContext = String(req.body?.time_context || "").toLowerCase();
    const weather = String(req.body?.weather || "").toLowerCase();
    const festival = String(req.body?.festival || "none").toLowerCase();
    const salaryCycle = String(req.body?.salary_cycle || "").toLowerCase();

    if (!cityId?.trim()) {
      return res.status(400).json({
        success: false,
        code: "CITY_ID_REQUIRED",
        message: "city_id (Location) is required before publishing.",
      });
    }

    if (!isSupportedCityId(cityId)) {
      return res.status(400).json({
        success: false,
        code: "CITY_ID_UNSUPPORTED",
        message: `Unsupported city_id '${cityId}'.`,
      });
    }

    if (!isTimeContextId(timeContext)) {
      return res.status(400).json({
        success: false,
        code: "INVALID_TIME_CONTEXT",
        message: "time_context must be one of: morning, afternoon, evening, night",
      });
    }

    if (!isWeatherId(weather)) {
      return res.status(400).json({
        success: false,
        code: "INVALID_WEATHER",
        message: "weather must be one of: normal, rain, heatwave, cold",
      });
    }

    if (!isFestivalOverrideId(festival)) {
      return res.status(400).json({
        success: false,
        code: "INVALID_FESTIVAL",
        message: "festival must be one of: none, diwali, holi, navratri, christmas, eid",
      });
    }

    if (!isSalaryCycleId(salaryCycle)) {
      return res.status(400).json({
        success: false,
        code: "INVALID_SALARY_CYCLE",
        message: "salary_cycle must be one of: premium, normal, savings",
      });
    }

    const { data: city, error: cityError } = await supabase
      .from("cities")
      .select("id, display_name, image_url")
      .eq("id", cityId)
      .maybeSingle();

    if (cityError) throw cityError;
    if (!city) {
      return res.status(404).json({
        success: false,
        code: "CITY_CONFIG_MISSING",
        message: `City '${cityId}' is not configured in the database.`,
      });
    }

    const payload: PublishedExperience = {
      city_id: cityId,
      time_context: timeContext,
      weather,
      festival,
      salary_cycle: salaryCycle,
      published_at: new Date().toISOString(),
      published_by: "admin",
    };

    const { error } = await supabase.from("system_metadata").upsert(
      {
        key: ACTIVE_EXPERIENCE_KEY,
        value: payload,
      },
      { onConflict: "key" }
    );
    if (error) throw error;

    await supabase.from("system_metadata").upsert(
      {
        key: ACTIVE_CITY_KEY,
        value: {
          city_id: cityId,
          published_at: payload.published_at,
          published_by: "admin",
        },
      },
      { onConflict: "key" }
    );

    return res.status(200).json({
      success: true,
      message: `Experience published for ${city.display_name}`,
      data: toPublicExperience(payload, { image_url: city.image_url ?? null }),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const setActiveCity = setActiveExperience;
