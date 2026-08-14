import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { SUPPORTED_CITY_IDS } from "../../constants/cities";

dotenv.config();
dotenv.config({ path: "dynamic-ui-backend.env" });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_SEED = path.join(__dirname, "dynamic_ui_seed.json");
const SEED_FILE = process.argv[2] || DEFAULT_SEED;

async function seed() {
  console.log(`Starting seed process with file: ${SEED_FILE}`);
  try {
    const rawData = fs.readFileSync(SEED_FILE, "utf8");
    const data = JSON.parse(rawData);

    const cityIds = Object.keys(data.cities || {});
    const unsupported = cityIds.filter(
      (id) => !(SUPPORTED_CITY_IDS as readonly string[]).includes(id)
    );
    if (unsupported.length) {
      throw new Error(`Seed contains unsupported cities: ${unsupported.join(", ")}`);
    }
    for (const required of SUPPORTED_CITY_IDS) {
      if (!cityIds.includes(required)) {
        throw new Error(`Seed missing required city: ${required}`);
      }
    }

    for (const [cityId, cityData] of Object.entries<any>(data.cities)) {
      console.log(`Seeding city: ${cityId}`);

      const cityPayload = {
        id: cityId,
        display_name: cityData.display_name,
        accent_color: cityData.accent_color,
        accent_light: cityData.accent_light,
        is_pure_veg_market: cityData.is_pure_veg_market,
        language_locale: cityData.language.locale,
        language_script: cityData.language.script,
        language_style: cityData.language.style,
        language_tagline: cityData.language.tagline,
        search_placeholder: cityData.language.search_placeholder,
        image_url: cityData.image_url || null,
      };

      const { error: cityErr } = await supabase
        .from("cities")
        .upsert(cityPayload, { onConflict: "id" });
      if (cityErr) console.error("Error seeding city:", cityErr);

      for (const [phase, greeting] of Object.entries<any>(
        cityData.language.greetings
      )) {
        await supabase.from("city_greetings").upsert(
          {
            city_id: cityId,
            phase_id: phase,
            line1: greeting.line1,
            line2: greeting.line2,
          },
          { onConflict: "city_id, phase_id" }
        );
      }

      for (const [cycle, message] of Object.entries<any>(
        cityData.language.salary_messages
      )) {
        await supabase.from("city_salary_messages").upsert(
          {
            city_id: cityId,
            salary_cycle_id: cycle,
            message,
          },
          { onConflict: "city_id, salary_cycle_id" }
        );
      }

      if (cityData.language.local_spotlight) {
        await supabase.from("local_spotlights").upsert(
          {
            city_id: cityId,
            emoji: cityData.language.local_spotlight.emoji,
            title: cityData.language.local_spotlight.title,
            sub: cityData.language.local_spotlight.sub,
          },
          { onConflict: "city_id" }
        );
      }

      if (cityData.language.ui_labels) {
        await supabase.from("ui_labels").upsert(
          {
            city_id: cityId,
            offers_section: cityData.language.ui_labels.offers_section,
            categories_section: cityData.language.ui_labels.categories_section,
            trending_section: cityData.language.ui_labels.trending_section,
            nearby_section: cityData.language.ui_labels.nearby_section,
            filter_btn: cityData.language.ui_labels.filter_btn,
            see_all: cityData.language.ui_labels.see_all,
            view_all: cityData.language.ui_labels.view_all,
            order_btn: cityData.language.ui_labels.order_btn,
            explore_btn: cityData.language.ui_labels.explore_btn,
            save_btn: cityData.language.ui_labels.save_btn,
          },
          { onConflict: "city_id" }
        );
      }

      for (const [phase, categories] of Object.entries<any>(cityData.categories)) {
        await supabase
          .from("city_categories")
          .delete()
          .eq("city_id", cityId)
          .eq("phase_id", phase);
        for (let i = 0; i < categories.length; i++) {
          const cat = categories[i];
          await supabase.from("city_categories").insert({
            city_id: cityId,
            phase_id: phase,
            emoji: cat.emoji,
            label: cat.label,
            filter_value: cat.filter,
            display_order: i,
          });
        }
      }

      await supabase.from("trending_tags").delete().eq("city_id", cityId);
      for (let i = 0; i < cityData.trending_tags.length; i++) {
        await supabase.from("trending_tags").insert({
          city_id: cityId,
          tag_name: cityData.trending_tags[i],
          display_order: i,
        });
      }

      // Preserve/upsert only restaurants present in seed — never invent for empty cities
      for (const rest of cityData.restaurants || []) {
        await supabase.from("restaurants").upsert(
          {
            id: rest.id,
            city_id: cityId,
            emoji: rest.emoji,
            name: rest.name,
            rating: rest.rating,
            time: rest.time,
            cuisine: rest.cuisine,
            discount: rest.discount,
            is_veg: rest.is_veg,
          },
          { onConflict: "id" }
        );
      }
    }

    console.log("Seeding day phases...");
    for (const [phaseId, phaseData] of Object.entries<any>(data.day_phases)) {
      await supabase.from("day_phases").upsert(
        {
          id: phaseId,
          label: phaseData.label,
          hours: phaseData.hours,
          mood: phaseData.mood,
          colors: phaseData.colors,
          weather_icon: phaseData.weather_icon,
          phase_label: phaseData.phase_label,
          phase_sub: phaseData.phase_sub,
          default_offers: phaseData.default_offers,
        },
        { onConflict: "id" }
      );
    }

    console.log("Seeding salary cycles...");
    for (const [cycleId, cycleData] of Object.entries<any>(data.salary_cycles)) {
      await supabase.from("salary_cycles").upsert(
        {
          id: cycleId,
          trigger_days: cycleData.trigger_days,
          label: cycleData.label,
          tone: cycleData.tone,
          avatar_ring_color: cycleData.avatar_ring_color,
          avatar_ring_label: cycleData.avatar_ring_label,
          banner: cycleData.banner,
          offer_chips: cycleData.offer_chips,
        },
        { onConflict: "id" }
      );
    }

    console.log("Seeding festival overlays (calendar)...");
    for (const [festId, festData] of Object.entries<any>(data.festival_overlays)) {
      await supabase.from("festival_overlays").upsert(
        {
          id: festId,
          active: festData.active ?? festData.enabled ?? false,
          enabled: festData.enabled ?? festData.active ?? false,
          start_date: festData.start_date || null,
          end_date: festData.end_date || null,
          city_id: festData.city_id || null,
          priority: festData.priority ?? 0,
          detection: festData.detection || "calendar",
          color_overrides: festData.color_overrides || null,
          banner: festData.banner || null,
          offer_chips: festData.offer_chips || null,
        },
        { onConflict: "id" }
      );

      if (festData.categories) {
        await supabase.from("festival_categories").delete().eq("festival_id", festId);
        for (let i = 0; i < festData.categories.length; i++) {
          const cat = festData.categories[i];
          await supabase.from("festival_categories").insert({
            festival_id: festId,
            emoji: cat.emoji,
            label: cat.label,
            display_order: i,
          });
        }
      }

      if (festData.greeting_override) {
        for (const [cityId, greeting] of Object.entries<any>(
          festData.greeting_override
        )) {
          if (!(SUPPORTED_CITY_IDS as readonly string[]).includes(cityId)) continue;
          await supabase.from("festival_greetings").upsert(
            {
              festival_id: festId,
              city_id: cityId,
              greeting,
            },
            { onConflict: "festival_id, city_id" }
          );
        }
      }
    }

    console.log("Seeding resolver config & metadata...");
    await supabase.from("resolver_configuration").upsert(
      {
        id: 1,
        priority: data.resolver.priority,
        note: data.resolver.note,
        weather_triggers: data.resolver.weather_triggers,
      },
      { onConflict: "id" }
    );

    const { error: metaErr } = await supabase.from("system_metadata").upsert(
      {
        key: "meta_info",
        value: data._meta,
      },
      { onConflict: "key" }
    );
    if (metaErr) console.error("Error seeding metadata:", metaErr);

    console.log("Seed process completed successfully!");
  } catch (err) {
    console.error("Error running seed script:", err);
    process.exit(1);
  }
}

seed();
