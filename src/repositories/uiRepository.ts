import supabase from '../config/supabase';

class UiRepository {
    async getCityConfig(cityId: string) {
        // Fetch city base data
        const { data: city, error: cityError } = await supabase
            .from('cities')
            .select('*')
            .eq('id', cityId)
            .single();
        if (cityError) throw cityError;

        // Fetch greetings
        const { data: greetings, error: greetingsError } = await supabase
            .from('city_greetings')
            .select('phase_id, line1, line2')
            .eq('city_id', cityId);
        if (greetingsError) throw greetingsError;

        // Fetch salary messages
        const { data: salaryMessages, error: salaryError } = await supabase
            .from('city_salary_messages')
            .select('salary_cycle_id, message')
            .eq('city_id', cityId);
        if (salaryError) throw salaryError;

        // Fetch local spotlight
        const { data: spotlight, error: spotlightError } = await supabase
            .from('local_spotlights')
            .select('emoji, title, sub')
            .eq('city_id', cityId)
            .maybeSingle();
        if (spotlightError) throw spotlightError;

        // Fetch UI labels
        const { data: uiLabels, error: uiLabelsError } = await supabase
            .from('ui_labels')
            .select('*')
            .eq('city_id', cityId)
            .maybeSingle();
        if (uiLabelsError) throw uiLabelsError;

        // Fetch categories
        const { data: categories, error: catError } = await supabase
            .from('city_categories')
            .select('phase_id, emoji, label, filter_value')
            .eq('city_id', cityId)
            .order('display_order', { ascending: true });
        if (catError) throw catError;

        // Fetch trending tags
        const { data: trendingTags, error: tagError } = await supabase
            .from('trending_tags')
            .select('tag_name')
            .eq('city_id', cityId)
            .order('display_order', { ascending: true });
        if (tagError) throw tagError;

        // Fetch restaurants
        const { data: restaurants, error: restError } = await supabase
            .from('restaurants')
            .select('*')
            .eq('city_id', cityId);
        if (restError) throw restError;

        return {
            city,
            greetings,
            salaryMessages,
            spotlight,
            uiLabels,
            categories,
            trendingTags,
            restaurants
        };
    }

    async getDayPhases() {
        const { data, error } = await supabase.from('day_phases').select('*');
        if (error) throw error;
        return data;
    }

    async getSalaryCycles() {
        const { data, error } = await supabase.from('salary_cycles').select('*');
        if (error) throw error;
        return data;
    }

    async getActiveFestivals() {
        const { data: festivals, error } = await supabase.from('festival_overlays').select('*').eq('active', true);
        if (error) throw error;
        
        // Fetch categories and greetings for active festivals
        for (let fest of (festivals || [])) {
            const { data: catData } = await supabase.from('festival_categories').select('*').eq('festival_id', fest.id).order('display_order');
            fest.categories = catData || [];
            
            const { data: greetData } = await supabase.from('festival_greetings').select('*').eq('festival_id', fest.id);
            fest.greetings = greetData || [];
        }

        return festivals;
    }

    async getResolverConfig() {
        const { data, error } = await supabase.from('resolver_configuration').select('*').eq('id', 1).single();
        if (error) throw error;
        return data;
    }
}

export default new UiRepository();
