import supabase from "../config/supabase";

class UiRepository {
  async getCityConfig(cityId: string) {
    const { data: city, error: cityError } = await supabase
      .from("cities")
      .select("*")
      .eq("id", cityId)
      .maybeSingle();

    if (cityError) throw cityError;
    if (!city) return null;

    const { data: greetings, error: greetingsError } = await supabase
      .from("city_greetings")
      .select("phase_id, line1, line2")
      .eq("city_id", cityId);
    if (greetingsError) throw greetingsError;

    const { data: salaryMessages, error: salaryError } = await supabase
      .from("city_salary_messages")
      .select("salary_cycle_id, message")
      .eq("city_id", cityId);
    if (salaryError) throw salaryError;

    const { data: spotlight, error: spotlightError } = await supabase
      .from("local_spotlights")
      .select("emoji, title, sub")
      .eq("city_id", cityId)
      .maybeSingle();
    if (spotlightError) throw spotlightError;

    const { data: uiLabels, error: uiLabelsError } = await supabase
      .from("ui_labels")
      .select("*")
      .eq("city_id", cityId)
      .maybeSingle();
    if (uiLabelsError) throw uiLabelsError;

    const { data: categories, error: catError } = await supabase
      .from("city_categories")
      .select("phase_id, emoji, label, filter_value")
      .eq("city_id", cityId)
      .order("display_order", { ascending: true });
    if (catError) throw catError;

    const { data: trendingTags, error: tagError } = await supabase
      .from("trending_tags")
      .select("tag_name")
      .eq("city_id", cityId)
      .order("display_order", { ascending: true });
    if (tagError) throw tagError;

    const { data: restaurants, error: restError } = await supabase
      .from("restaurants")
      .select("*")
      .eq("city_id", cityId);
    if (restError) throw restError;

    return {
      city,
      greetings: greetings || [],
      salaryMessages: salaryMessages || [],
      spotlight,
      uiLabels,
      categories: categories || [],
      trendingTags: trendingTags || [],
      restaurants: restaurants || [],
    };
  }

  async getDayPhases() {
    const { data, error } = await supabase.from("day_phases").select("*");
    if (error) throw error;
    return data || [];
  }

  async getSalaryCycles() {
    const { data, error } = await supabase.from("salary_cycles").select("*");
    if (error) throw error;
    return data || [];
  }

  /**
   * Calendar festival resolution:
   * enabled + date window + (city_id null OR matches) + highest priority.
   */
  async getActiveFestivalForCity(cityId: string, dateStr: string) {
    const { data: festivals, error } = await supabase
      .from("festival_overlays")
      .select("*")
      .or("enabled.eq.true,active.eq.true");

    if (error) throw error;

    const inWindow = (festivals || []).filter((fest: any) => {
      const enabled = fest.enabled ?? fest.active ?? false;
      if (!enabled) return false;
      if (!fest.start_date || !fest.end_date) return false;
      if (dateStr < fest.start_date || dateStr > fest.end_date) return false;
      if (fest.city_id && fest.city_id !== cityId) return false;
      return true;
    });

    inWindow.sort((a: any, b: any) => (b.priority || 0) - (a.priority || 0));
    const fest = inWindow[0];
    if (!fest) return null;

    const { data: catData } = await supabase
      .from("festival_categories")
      .select("*")
      .eq("festival_id", fest.id)
      .order("display_order");
    fest.categories = catData || [];

    const { data: greetData } = await supabase
      .from("festival_greetings")
      .select("*")
      .eq("festival_id", fest.id);
    fest.greetings = greetData || [];

    return fest;
  }

  async getResolverConfig() {
    const { data, error } = await supabase
      .from("resolver_configuration")
      .select("*")
      .eq("id", 1)
      .single();
    if (error) throw error;
    return data;
  }
}

export default new UiRepository();
