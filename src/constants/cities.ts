export const SUPPORTED_CITY_IDS = [
  "ahmedabad",
  "mumbai",
  "odisha",
  "delhi",
  "bengaluru",
  "hyderabad",
] as const;

export type SupportedCityId = (typeof SUPPORTED_CITY_IDS)[number];

export const SUPPORTED_CITY_LABELS: Record<SupportedCityId, string> = {
  ahmedabad: "Ahmedabad, Gujarat",
  mumbai: "Mumbai, Maharashtra",
  odisha: "Bhubaneswar, Odisha",
  delhi: "Delhi, Delhi",
  bengaluru: "Bengaluru, Karnataka",
  hyderabad: "Hyderabad, Telangana",
};

export function isSupportedCityId(cityId: string): cityId is SupportedCityId {
  return (SUPPORTED_CITY_IDS as readonly string[]).includes(cityId);
}

/** Hard-coded salary windows (source of truth for resolver). */
export const SALARY_CYCLE_WINDOWS = {
  premium: { start: 1, end: 5 },
  normal: { start: 6, end: 24 },
  savings: { start: 25, end: 31 },
} as const;
