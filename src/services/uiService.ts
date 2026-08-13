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
  async resolveUiTheme(cityId: string, clientTime: string, dayOfMonth: number) {
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
    const currentPhase = this.determinePhase(this.extractTime(clientTime), dayPhases);
    const currentSalaryCycle = this.determineSalaryCycle(dayOfMonth, salaryCycles);
    const currentFestival = await uiRepository.getActiveFestivalForCity(
      cityId,
      this.extractDate(clientTime)
    );

    const mergedColors = this.mergeColors(cityConfig.city, currentPhase, currentFestival);
    const mergedContent = this.mergeContent(
      cityConfig,
      currentPhase,
      currentSalaryCycle,
      currentFestival
    );

    return {
      theme_id: `${cityId}_${currentPhase?.id}_${currentSalaryCycle?.id}${
        currentFestival ? `_${currentFestival.id}` : ""
      }`,
      city: cityConfig.city,
      phase: currentPhase,
      salary: currentSalaryCycle,
      festival: currentFestival,
      merged_colors: mergedColors,
      merged_content: mergedContent,
      cache_ttl_seconds: 3600,
      refresh_on_hour: true,
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

  private mergeColors(city: any, phase: any, festival: any) {
    let colors = { ...(phase?.colors || {}) };
    colors.primary_accent = city.accent_color;
    colors.accent_light = city.accent_light;

    if (festival?.color_overrides) {
      colors = { ...colors, ...festival.color_overrides };
    }
    return colors;
  }

  private mergeContent(cityConfig: any, phase: any, salary: any, festival: any) {
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

    const phaseGreeting = greetings.find((g: any) => g.phase_id === phase?.id) || {};
    let greeting_line1 = phaseGreeting.line1 || "";
    let greeting_line2 = phaseGreeting.line2 || "";

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
    if (festival?.offer_chips?.length) offerChips = festival.offer_chips;

    const mainBanner = festival?.banner || salary?.banner || {};

    return {
      greeting_line1,
      greeting_line2,
      tagline: city.language_tagline,
      search_placeholder: city.search_placeholder,
      salary_message: salMessage ? salMessage.message : null,
      weather_icon: phase?.weather_icon,
      phase_label: phase?.phase_label,
      phase_sub: phase?.phase_sub,
      salary_banner: salary?.banner || null,
      festival_banner: festival?.banner || null,
      main_banner: mainBanner,
      local_spotlight: spotlight || null,
      categories: phaseCategories,
      trending_tags: (trendingTags || []).map((t: any) => t.tag_name),
      offer_chips: offerChips,
      restaurants: restaurants || [],
      ui_labels: uiLabels,
    };
  }
}

export default new UiService();
