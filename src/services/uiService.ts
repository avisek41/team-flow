import { SALARY_CYCLE_WINDOWS } from "../constants/cities";
import uiRepository from "../repositories/uiRepository";

export class CityConfigMissingError extends Error {
  code = "CITY_CONFIG_MISSING";
  status = 404;
  details: string[];

  constructor(cityId: string, details: string[]) {
    super(`City configuration incomplete for id: ${cityId}`);
    this.details = details;
  }
}

class UiService {
  async resolveUiTheme(
    cityId: string,
    clientTime: string,
    dayOfMonth: number,
    overrides?: {
      time_context?: string;
      salary_cycle?: string;
      festival?: string;
      weather?: string;
      source?: "admin_published" | "client";
    }
  ) {
    const cityConfig = await uiRepository.getCityConfig(cityId);
    if (!cityConfig || !cityConfig.city) {
      throw new CityConfigMissingError(cityId, ["city row not found"]);
    }

    const missing = this.validateCityPack(cityConfig);
    if (missing.length > 0) {
      throw new CityConfigMissingError(cityId, missing);
    }

    const dayPhases = await uiRepository.getDayPhases();
    const salaryCycles = await uiRepository.getSalaryCycles();

    let currentPhase = this.determinePhase(this.extractTime(clientTime), dayPhases);
    if (overrides?.time_context) {
      currentPhase =
        dayPhases.find((p: any) => p.id === overrides.time_context) || currentPhase;
    }

    let currentSalaryCycle = this.determineSalaryCycle(dayOfMonth, salaryCycles);
    if (overrides?.salary_cycle) {
      currentSalaryCycle =
        salaryCycles.find((c: any) => c.id === overrides.salary_cycle) ||
        currentSalaryCycle;
    }

    let currentFestival: any = null;
    if (overrides?.festival !== undefined) {
      if (overrides.festival === "none" || !overrides.festival) {
        currentFestival = null;
      } else {
        currentFestival = await uiRepository.getFestivalById(overrides.festival);
      }
    } else {
      currentFestival = await uiRepository.getActiveFestivalForCity(
        cityId,
        this.extractDate(clientTime)
      );
    }

    const weatherId = overrides?.weather || "normal";
    const weatherOverlay = await uiRepository.getWeatherOverlay(weatherId);
    const cityWeatherMessage = await uiRepository.getCityWeatherMessage(
      cityId,
      weatherId
    );

    const mergedColors = this.mergeColors(
      cityConfig.city,
      currentPhase,
      currentFestival,
      weatherOverlay
    );
    const mergedContent = this.mergeContent(
      cityConfig,
      currentPhase,
      currentSalaryCycle,
      currentFestival,
      weatherOverlay,
      cityWeatherMessage
    );

    return {
      theme_id: `${cityId}_${currentPhase?.id}_${currentSalaryCycle?.id}_${weatherId}${
        currentFestival ? `_${currentFestival.id}` : ""
      }`,
      city: cityConfig.city,
      phase: currentPhase,
      salary: currentSalaryCycle,
      festival: currentFestival,
      weather: weatherOverlay || { id: weatherId },
      admin_context:
        overrides?.source === "admin_published"
          ? {
              city_id: cityId,
              time_context: overrides.time_context,
              weather: overrides.weather,
              festival: overrides.festival,
              salary_cycle: overrides.salary_cycle,
            }
          : null,
      merged_colors: mergedColors,
      merged_content: mergedContent,
      cache_ttl_seconds: 3600,
      refresh_on_hour: overrides?.source !== "admin_published",
    };
  }

  private validateCityPack(cityConfig: any): string[] {
    const missing: string[] = [];
    const phases = ["morning", "afternoon", "evening", "night"];
    const cycles = ["premium", "normal", "savings"];

    if (!cityConfig.uiLabels) missing.push("ui_labels");
    if (!cityConfig.spotlight) missing.push("local_spotlights");
    if (!cityConfig.trendingTags?.length) missing.push("trending_tags");

    for (const phase of phases) {
      if (!cityConfig.greetings?.some((g: any) => g.phase_id === phase)) {
        missing.push(`city_greetings.${phase}`);
      }
      if (!cityConfig.categories?.some((c: any) => c.phase_id === phase)) {
        missing.push(`city_categories.${phase}`);
      }
    }

    for (const cycle of cycles) {
      if (!cityConfig.salaryMessages?.some((s: any) => s.salary_cycle_id === cycle)) {
        missing.push(`city_salary_messages.${cycle}`);
      }
    }

    return missing;
  }

  private extractTime(clientTime: string) {
    return clientTime.split("T")[1]
      ? clientTime.split("T")[1].substring(0, 5)
      : "12:00";
  }

  private extractDate(clientTime: string) {
    return clientTime.split("T")[0] || new Date().toISOString().split("T")[0];
  }

  private determinePhase(timeStr: string, phases: any[]) {
    const hour = parseInt(timeStr.split(":")[0], 10);
    const min = parseInt(timeStr.split(":")[1], 10);
    const timeInMins = hour * 60 + min;

    for (const phase of phases) {
      const [start, end] = (phase.hours || "12:00–12:00").split("–");
      const startMins = this.toMins(start || "12:00");
      let endMins = this.toMins(end || "12:00");

      if (startMins > endMins) {
        if (timeInMins >= startMins || timeInMins <= endMins) return phase;
      } else if (timeInMins >= startMins && timeInMins <= endMins) {
        return phase;
      }
    }
    return phases[0];
  }

  private toMins(timeStr: string) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":");
    return parseInt(h, 10) * 60 + parseInt(m, 10);
  }

  private determineSalaryCycle(day: number, cycles: any[]) {
    let cycleId: "premium" | "normal" | "savings" = "normal";
    if (
      day >= SALARY_CYCLE_WINDOWS.premium.start &&
      day <= SALARY_CYCLE_WINDOWS.premium.end
    ) {
      cycleId = "premium";
    } else if (
      day >= SALARY_CYCLE_WINDOWS.savings.start &&
      day <= SALARY_CYCLE_WINDOWS.savings.end
    ) {
      cycleId = "savings";
    } else {
      cycleId = "normal";
    }

    return cycles.find((c) => c.id === cycleId) || null;
  }

  private mergeColors(city: any, phase: any, festival: any, weather: any) {
    let colors = { ...(phase?.colors || {}) };
    colors.primary_accent = city.accent_color;
    colors.accent_light = city.accent_light;

    if (weather?.color_overrides) {
      colors = { ...colors, ...weather.color_overrides };
    }
    if (festival?.color_overrides) {
      colors = { ...colors, ...festival.color_overrides };
    }
    return colors;
  }

  private mergeContent(
    cityConfig: any,
    phase: any,
    salary: any,
    festival: any,
    weather: any,
    cityWeatherMessage: any
  ) {
    const {
      city,
      greetings,
      salaryMessages,
      spotlight,
      uiLabels,
      categories,
      trendingTags,
      restaurants,
    } = cityConfig;

    const weatherId = weather?.id || "normal";

    const phaseGreeting = greetings.find((g: any) => g.phase_id === phase?.id) || {};
    let greeting_line1 = phaseGreeting.line1 || "";
    let greeting_line2 = phaseGreeting.line2 || "";

    // Weather overrides city phase greetings (unless festival later overrides)
    if (weatherId !== "normal") {
      if (cityWeatherMessage?.line1) {
        greeting_line1 = cityWeatherMessage.line1;
        greeting_line2 = cityWeatherMessage.line2 || "";
      } else if (weather?.greeting_line1) {
        greeting_line1 = weather.greeting_line1;
        greeting_line2 = weather.greeting_line2 || "";
      }
    }

    if (festival?.greetings?.length) {
      const festGreeting = festival.greetings.find((g: any) => g.city_id === city.id);
      if (festGreeting) {
        greeting_line1 = festGreeting.greeting;
        greeting_line2 = "";
      }
    }

    const salMessage = salaryMessages.find(
      (s: any) => s.salary_cycle_id === salary?.id
    );

    let phaseCategories = categories.filter((c: any) => c.phase_id === phase?.id);
    if (festival?.categories?.length) {
      phaseCategories = festival.categories;
    }

    let offerChips = phase?.default_offers || [];
    if (salary?.offer_chips?.length) offerChips = salary.offer_chips;
    if (weatherId !== "normal" && weather?.offer_chips?.length) {
      offerChips = weather.offer_chips;
    }
    if (festival?.offer_chips?.length) offerChips = festival.offer_chips;

    let phase_sub = phase?.phase_sub || null;
    if (weatherId !== "normal" && weather?.phase_sub) {
      phase_sub = weather.phase_sub;
    }

    let search_placeholder = city.search_placeholder;
    if (weatherId !== "normal" && weather?.search_hint) {
      search_placeholder = weather.search_hint;
    }

    const weatherBanner =
      weatherId !== "normal" && weather?.banner ? weather.banner : null;
    const mainBanner = festival?.banner || weatherBanner || salary?.banner || {};

    // Soft-adjust UI labels section titles for weather modes
    let labels = uiLabels ? { ...uiLabels } : null;
    if (labels && weatherId === "rain") {
      labels.offers_section = "Monsoon Offers";
      labels.trending_section = "🌧️ Rainy favourites";
    } else if (labels && weatherId === "heatwave") {
      labels.offers_section = "Cooling Deals";
      labels.trending_section = "🥵 Cool picks";
    } else if (labels && weatherId === "cold") {
      labels.offers_section = "Warming Offers";
      labels.trending_section = "❄️ Hot favourites";
    }

    return {
      greeting_line1,
      greeting_line2,
      tagline: city.language_tagline,
      search_placeholder,
      salary_message: salMessage ? salMessage.message : null,
      weather: weatherId,
      weather_label: weather?.label || weatherId,
      weather_emoji: weather?.emoji || null,
      weather_icon: weather?.emoji || phase?.weather_icon,
      phase_label: phase?.phase_label,
      phase_sub,
      salary_banner: salary?.banner || null,
      festival_banner: festival?.banner || null,
      weather_banner: weatherBanner,
      main_banner: mainBanner,
      local_spotlight: spotlight || null,
      categories: phaseCategories,
      trending_tags: (trendingTags || []).map((t: any) => t.tag_name),
      offer_chips: offerChips,
      restaurants: restaurants || [],
      ui_labels: labels,
    };
  }
}

export default new UiService();
