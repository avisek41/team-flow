import supabase from "../config/supabase";
import { isSupportedCityId } from "../constants/cities";
import {
  ACTIVE_CITY_KEY,
  ACTIVE_EXPERIENCE_KEY,
  parsePublishedExperience,
  type PublishedExperience,
} from "../constants/experience";

export async function readPublishedExperience(): Promise<PublishedExperience> {
  const { data, error } = await supabase
    .from("system_metadata")
    .select("key, value")
    .in("key", [ACTIVE_EXPERIENCE_KEY, ACTIVE_CITY_KEY]);

  if (error) throw error;

  const rows = data || [];
  const experienceRow = rows.find((r) => r.key === ACTIVE_EXPERIENCE_KEY);
  const parsed = parsePublishedExperience(experienceRow?.value);
  if (parsed) return parsed;

  const cityRow = rows.find((r) => r.key === ACTIVE_CITY_KEY);
  const legacy = cityRow?.value as { city_id?: string; published_at?: string } | undefined;
  if (legacy?.city_id && isSupportedCityId(legacy.city_id)) {
    return {
      city_id: legacy.city_id,
      time_context: "morning",
      weather: "normal",
      festival: "none",
      salary_cycle: "normal",
      published_at: legacy.published_at || new Date().toISOString(),
      published_by: "admin",
    };
  }

  // Default when admin has not published yet
  return {
    city_id: "ahmedabad",
    time_context: "morning",
    weather: "normal",
    festival: "none",
    salary_cycle: "normal",
    published_at: new Date().toISOString(),
    published_by: "system_default",
  };
}
