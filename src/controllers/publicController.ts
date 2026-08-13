import { Request, Response } from "express";
import supabase from "../config/supabase";
import { isSupportedCityId, SUPPORTED_CITY_IDS } from "../constants/cities";

const cityFilter = (req: Request) => {
  const cityId = req.query.city_id as string | undefined;
  if (!cityId) return { ok: true as const, cityId: undefined };
  if (!isSupportedCityId(cityId)) {
    return {
      ok: false as const,
      error: {
        success: false,
        code: "CITY_ID_UNSUPPORTED",
        message: `Unsupported city_id '${cityId}'.`,
      },
    };
  }
  return { ok: true as const, cityId };
};

export const getCities = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .in("id", [...SUPPORTED_CITY_IDS]);
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const filter = cityFilter(req);
    if (!filter.ok) return res.status(400).json(filter.error);

    let query = supabase.from("city_categories").select("*");
    if (filter.cityId) query = query.eq("city_id", filter.cityId);

    const { data, error } = await query;
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRestaurants = async (req: Request, res: Response) => {
  try {
    const filter = cityFilter(req);
    if (!filter.ok) return res.status(400).json(filter.error);

    let query = supabase.from("restaurants").select("*");
    if (filter.cityId) query = query.eq("city_id", filter.cityId);

    const { data, error } = await query;
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDayPhases = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("day_phases").select("*");
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSalaryCycles = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("salary_cycles").select("*");
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFestivals = async (req: Request, res: Response) => {
  try {
    const filter = cityFilter(req);
    if (!filter.ok) return res.status(400).json(filter.error);

    let query = supabase.from("festival_overlays").select("*");
    if (filter.cityId) {
      query = query.or(`city_id.is.null,city_id.eq.${filter.cityId}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllData = async (req: Request, res: Response) => {
  try {
    const filter = cityFilter(req);
    if (!filter.ok) return res.status(400).json(filter.error);

    const citiesQuery = supabase
      .from("cities")
      .select("*")
      .in("id", [...SUPPORTED_CITY_IDS]);

    let categoriesQuery = supabase.from("city_categories").select("*");
    let restaurantsQuery = supabase.from("restaurants").select("*");
    if (filter.cityId) {
      categoriesQuery = categoriesQuery.eq("city_id", filter.cityId);
      restaurantsQuery = restaurantsQuery.eq("city_id", filter.cityId);
    }

    const [
      citiesRes,
      categoriesRes,
      restaurantsRes,
      dayPhasesRes,
      salaryCyclesRes,
      festivalsRes,
    ] = await Promise.all([
      citiesQuery,
      categoriesQuery,
      restaurantsQuery,
      supabase.from("day_phases").select("*"),
      supabase.from("salary_cycles").select("*"),
      supabase.from("festival_overlays").select("*"),
    ]);

    const errors = [
      citiesRes,
      categoriesRes,
      restaurantsRes,
      dayPhasesRes,
      salaryCyclesRes,
      festivalsRes,
    ]
      .map((r) => r.error)
      .filter((err) => err !== null);

    if (errors.length > 0) throw errors[0];

    res.status(200).json({
      success: true,
      data: {
        cities: citiesRes.data,
        categories: categoriesRes.data,
        restaurants: restaurantsRes.data,
        day_phases: dayPhasesRes.data,
        salary_cycles: salaryCyclesRes.data,
        festivals: festivalsRes.data,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
