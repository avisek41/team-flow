import { Request, Response } from "express";
import supabase from "../config/supabase";
import { isSupportedCityId, SUPPORTED_CITY_LABELS } from "../constants/cities";

const ACTIVE_CITY_KEY = "active_city";

type ActiveCityValue = {
  city_id: string;
  published_at: string;
  published_by?: string;
};

async function readActiveCity(): Promise<ActiveCityValue | null> {
  const { data, error } = await supabase
    .from("system_metadata")
    .select("value")
    .eq("key", ACTIVE_CITY_KEY)
    .maybeSingle();

  if (error) throw error;
  if (!data?.value) return null;

  const value = data.value as ActiveCityValue;
  if (!value.city_id || !isSupportedCityId(value.city_id)) return null;
  return value;
}

/** Mobile: detect which city admin published */
export const getActiveCity = async (_req: Request, res: Response) => {
  try {
    const active = await readActiveCity();

    if (!active) {
      return res.status(404).json({
        success: false,
        code: "ACTIVE_CITY_NOT_SET",
        message:
          "No active city has been published by admin yet. Publish a city from Dynamic Experience Studio.",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        city_id: active.city_id,
        display_name: SUPPORTED_CITY_LABELS[active.city_id],
        published_at: active.published_at,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

/** Admin: save/publish selected city for mobile to consume */
export const setActiveCity = async (req: Request, res: Response) => {
  try {
    const cityId = req.body?.city_id as string | undefined;

    if (!cityId || !cityId.trim()) {
      return res.status(400).json({
        success: false,
        code: "CITY_ID_REQUIRED",
        message: "city_id is required. Select a city before publishing.",
      });
    }

    if (!isSupportedCityId(cityId)) {
      return res.status(400).json({
        success: false,
        code: "CITY_ID_UNSUPPORTED",
        message: `Unsupported city_id '${cityId}'.`,
      });
    }

    const { data: city, error: cityError } = await supabase
      .from("cities")
      .select("id, display_name")
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

    const payload: ActiveCityValue = {
      city_id: cityId,
      published_at: new Date().toISOString(),
      published_by: "admin",
    };

    const { data, error } = await supabase
      .from("system_metadata")
      .upsert(
        {
          key: ACTIVE_CITY_KEY,
          value: payload,
        },
        { onConflict: "key" }
      )
      .select()
      .maybeSingle();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: `Active city published: ${city.display_name}`,
      data: {
        city_id: cityId,
        display_name: city.display_name,
        published_at: payload.published_at,
        metadata: data,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
