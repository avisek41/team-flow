import { Request, Response } from "express";
import supabase from "../config/supabase";
import { isSupportedCityId, SUPPORTED_CITY_IDS } from "../constants/cities";

const PROTECTED_FIELDS = ["id", "created_at", "updated_at"];

const removeProtectedFields = (body: any) => {
  const data = { ...body };
  PROTECTED_FIELDS.forEach((field) => delete data[field]);
  return data;
};

/** Express 5 types params as string | string[]; normalize to a single string. */
const paramAsString = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
};

const validateCityIdInBody = (body: any, table: string) => {
  if (table === "cities") {
    if (body.id && !isSupportedCityId(body.id)) {
      return `Unsupported city id '${body.id}'. Allowed: ${SUPPORTED_CITY_IDS.join(", ")}`;
    }
    return null;
  }

  if ("city_id" in body) {
    if (!body.city_id) {
      return "city_id is required and cannot be null.";
    }
    if (!isSupportedCityId(body.city_id)) {
      return `Unsupported city_id '${body.city_id}'. Allowed: ${SUPPORTED_CITY_IDS.join(", ")}`;
    }
  }

  return null;
};

export const listResource = (table: string) => async (req: Request, res: Response) => {
  try {
    let query = supabase.from(table).select("*");

    if (table === "cities") {
      query = query.in("id", [...SUPPORTED_CITY_IDS]);
    }

    const cityId = req.query.city_id as string | undefined;
    if (cityId) {
      if (!isSupportedCityId(cityId)) {
        return res.status(400).json({
          success: false,
          code: "CITY_ID_UNSUPPORTED",
          message: `Unsupported city_id '${cityId}'.`,
        });
      }
      query = query.eq("city_id", cityId);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "List failed.",
      errors: [error.message],
    });
  }
};

export const createResource = (table: string) => async (req: Request, res: Response) => {
  try {
    const validationError = validateCityIdInBody(req.body, table);
    if (validationError) {
      return res.status(400).json({
        success: false,
        code: "CITY_ID_INVALID",
        message: validationError,
      });
    }

    const { data, error } = await supabase.from(table).insert(req.body).select();
    if (error) throw error;
    res.status(201).json({
      success: true,
      message: "Resource created successfully.",
      data: data[0],
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: [error.message],
    });
  }
};

export const updateResource = (table: string) => async (req: Request, res: Response) => {
  try {
    const id = paramAsString(req.params.id);
    const updateData = removeProtectedFields(req.body);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    const validationError = validateCityIdInBody(updateData, table);
    if (validationError) {
      return res.status(400).json({
        success: false,
        code: "CITY_ID_INVALID",
        message: validationError,
      });
    }

    const { data, error } = await supabase
      .from(table)
      .update(updateData)
      .eq("id", id)
      .select();
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Resource updated successfully.",
      data: data[0],
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Update failed.",
      errors: [error.message],
    });
  }
};

export const deleteResource = (table: string) => async (req: Request, res: Response) => {
  try {
    const id = paramAsString(req.params.id);

    if (table === "cities" && !isSupportedCityId(id)) {
      return res.status(400).json({
        success: false,
        message: "Cannot operate on unsupported city ids.",
      });
    }

    // Do not allow deleting the six supported cities
    if (table === "cities" && isSupportedCityId(id)) {
      return res.status(400).json({
        success: false,
        code: "CITY_DELETE_FORBIDDEN",
        message: "Supported cities cannot be deleted.",
      });
    }

    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;
    res.status(200).json({
      success: true,
      message: "Resource deleted successfully.",
      data: {},
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Delete failed. Dependent records might exist.",
      errors: [error.message],
    });
  }
};
