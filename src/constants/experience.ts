import { isSupportedCityId, SUPPORTED_CITY_LABELS, type SupportedCityId } from "./cities";

export const TIME_CONTEXT_IDS = ["morning", "afternoon", "evening", "night"] as const;
export type TimeContextId = (typeof TIME_CONTEXT_IDS)[number];

export const WEATHER_IDS = ["normal", "rain", "heatwave", "cold"] as const;
export type WeatherId = (typeof WEATHER_IDS)[number];

export const SALARY_CYCLE_IDS = ["premium", "normal", "savings"] as const;
export type SalaryCycleId = (typeof SALARY_CYCLE_IDS)[number];

/** Festival override; "none" means force non-festival experience */
export const FESTIVAL_OVERRIDE_IDS = [
  "none",
  "diwali",
  "holi",
  "navratri",
  "christmas",
  "eid",
] as const;
export type FestivalOverrideId = (typeof FESTIVAL_OVERRIDE_IDS)[number];

export const ACTIVE_EXPERIENCE_KEY = "active_experience";
/** Legacy key — migrated/read for backward compatibility */
export const ACTIVE_CITY_KEY = "active_city";

export type PublishedExperience = {
  city_id: SupportedCityId;
  time_context: TimeContextId;
  weather: WeatherId;
  festival: FestivalOverrideId;
  salary_cycle: SalaryCycleId;
  published_at: string;
  published_by?: string;
};

export function isTimeContextId(value: string): value is TimeContextId {
  return (TIME_CONTEXT_IDS as readonly string[]).includes(value);
}

export function isWeatherId(value: string): value is WeatherId {
  return (WEATHER_IDS as readonly string[]).includes(value);
}

export function isSalaryCycleId(value: string): value is SalaryCycleId {
  return (SALARY_CYCLE_IDS as readonly string[]).includes(value);
}

export function isFestivalOverrideId(value: string): value is FestivalOverrideId {
  return (FESTIVAL_OVERRIDE_IDS as readonly string[]).includes(value);
}

/** Map Studio UI labels → API ids */
export function mapStudioTimeContext(value: string): TimeContextId | null {
  const map: Record<string, TimeContextId> = {
    Morning: "morning",
    Afternoon: "afternoon",
    Evening: "evening",
    Night: "night",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night",
  };
  return map[value] ?? null;
}

export function mapStudioWeather(value: string): WeatherId | null {
  const map: Record<string, WeatherId> = {
    Normal: "normal",
    Rain: "rain",
    Heatwave: "heatwave",
    Cold: "cold",
    normal: "normal",
    rain: "rain",
    heatwave: "heatwave",
    cold: "cold",
  };
  return map[value] ?? null;
}

export function mapStudioFestival(value: string): FestivalOverrideId | null {
  const map: Record<string, FestivalOverrideId> = {
    None: "none",
    Diwali: "diwali",
    Holi: "holi",
    Navratri: "navratri",
    Christmas: "christmas",
    Eid: "eid",
    none: "none",
    diwali: "diwali",
    holi: "holi",
    navratri: "navratri",
    christmas: "christmas",
    eid: "eid",
  };
  return map[value] ?? null;
}

export function toPublicExperience(
  value: PublishedExperience,
  extras?: { image_url?: string | null }
) {
  return {
    city_id: value.city_id,
    display_name: SUPPORTED_CITY_LABELS[value.city_id],
    image_url: extras?.image_url ?? null,
    time_context: value.time_context,
    weather: value.weather,
    festival: value.festival,
    salary_cycle: value.salary_cycle,
    published_at: value.published_at,
  };
}

export function parsePublishedExperience(raw: unknown): PublishedExperience | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Record<string, unknown>;
  const cityId = String(v.city_id || "");
  if (!isSupportedCityId(cityId)) return null;

  const time = String(v.time_context || "morning");
  const weather = String(v.weather || "normal");
  const festival = String(v.festival || "none");
  const salary = String(v.salary_cycle || "normal");

  if (!isTimeContextId(time)) return null;
  if (!isWeatherId(weather)) return null;
  if (!isFestivalOverrideId(festival)) return null;
  if (!isSalaryCycleId(salary)) return null;

  return {
    city_id: cityId,
    time_context: time,
    weather,
    festival,
    salary_cycle: salary,
    published_at: String(v.published_at || new Date().toISOString()),
    published_by: v.published_by ? String(v.published_by) : undefined,
  };
}
