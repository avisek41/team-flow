import uiRepository from '../repositories/uiRepository';

class UiService {
    async resolveUiTheme(cityId: string, clientTime: string, dayOfMonth: number) {
        // Fetch base city configuration
        const cityConfig = await uiRepository.getCityConfig(cityId);
        if (!cityConfig || !cityConfig.city) {
            throw new Error(`City configuration not found for id: ${cityId}`);
        }

        // Fetch day phases, salary cycles, active festivals
        const dayPhases = await uiRepository.getDayPhases();
        const salaryCycles = await uiRepository.getSalaryCycles();
        const festivals = await uiRepository.getActiveFestivals();

        // 1. Determine Day Phase based on clientTime
        const hourStr = clientTime.split('T')[1] ? clientTime.split('T')[1].substring(0, 5) : '12:00';
        let currentPhase = this.determinePhase(hourStr, dayPhases);

        // 2. Determine Salary Cycle based on dayOfMonth
        let currentSalaryCycle = this.determineSalaryCycle(dayOfMonth, salaryCycles);

        // 3. Determine Active Festival (simplification: if there is an active festival, use the first one)
        let currentFestival = festivals.length > 0 ? festivals[0] : null;

        // Merge logic based on priority: festival -> salary_cycle -> day_phase -> city_default
        const mergedColors = this.mergeColors(cityConfig.city, currentPhase, currentFestival);
        const mergedContent = this.mergeContent(cityConfig, currentPhase, currentSalaryCycle, currentFestival);

        return {
            theme_id: `${cityId}_${currentPhase?.id}_${currentSalaryCycle?.id}${currentFestival ? '_' + currentFestival.id : ''}`,
            city: cityConfig.city,
            phase: currentPhase,
            salary: currentSalaryCycle,
            festival: currentFestival,
            merged_colors: mergedColors,
            merged_content: mergedContent,
            cache_ttl_seconds: 3600,
            refresh_on_hour: true
        };
    }

    private determinePhase(timeStr: string, phases: any[]) {
        const hour = parseInt(timeStr.split(':')[0], 10);
        const min = parseInt(timeStr.split(':')[1], 10);
        const timeInMins = hour * 60 + min;

        for (const phase of phases) {
            const [start, end] = (phase.hours || '12:00–12:00').split('–'); // handle ndash
            const startMins = this.toMins(start || '12:00');
            let endMins = this.toMins(end || '12:00');

            if (startMins > endMins) {
                // crosses midnight
                if (timeInMins >= startMins || timeInMins <= endMins) return phase;
            } else {
                if (timeInMins >= startMins && timeInMins <= endMins) return phase;
            }
        }
        return phases[0]; // fallback
    }

    private toMins(timeStr: string) {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':');
        return parseInt(h, 10) * 60 + parseInt(m, 10);
    }

    private determineSalaryCycle(day: number, cycles: any[]) {
        for (const cycle of cycles) {
            if (typeof cycle.trigger_days === 'string' && cycle.trigger_days.includes('–')) {
        const [start, end] = cycle.trigger_days.split('–').map(Number);
                if (day >= start && day <= end) return cycle;
            } else if (Array.isArray(cycle.trigger_days)) {
                if (cycle.trigger_days.includes(day)) return cycle;
            }
        }
        // Fallback to normal
        return cycles.find(c => c.id === 'normal') || null;
    }

    private mergeColors(city: any, phase: any, festival: any) {
        let colors = { ...phase?.colors };
        colors.primary_accent = city.accent_color;

        // Apply festival overrides
        if (festival && festival.color_overrides) {
            colors = { ...colors, ...festival.color_overrides };
        }
        return colors;
    }

    private mergeContent(cityConfig: any, phase: any, salary: any, festival: any) {
        const { city, greetings, salaryMessages, spotlight, uiLabels, categories, trendingTags, restaurants } = cityConfig;

        // Find phase-specific greeting
        const phaseGreeting = greetings.find((g: any) => g.phase_id === phase?.id) || {};
        
        let greeting_line1 = phaseGreeting.line1 || '';
        let greeting_line2 = phaseGreeting.line2 || '';

        // Festival overrides greeting
        if (festival && festival.greetings && festival.greetings.length > 0) {
            const festGreeting = festival.greetings.find((g: any) => g.city_id === city.id);
            if (festGreeting) {
                greeting_line1 = festGreeting.greeting;
                greeting_line2 = '';
            }
        }

        // Salary message
        const salMessage = salaryMessages.find((s: any) => s.salary_cycle_id === salary?.id);

        // Phase specific categories
        let phaseCategories = categories.filter((c: any) => c.phase_id === phase?.id);

        // Festival overrides categories
        if (festival && festival.categories && festival.categories.length > 0) {
            phaseCategories = festival.categories;
        }

        // Offer chips
        let offerChips = phase?.default_offers || [];
        if (salary?.offer_chips && salary.offer_chips.length > 0) offerChips = salary.offer_chips;
        if (festival?.offer_chips && festival.offer_chips.length > 0) offerChips = festival.offer_chips;

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
            main_banner: {}, // Could be computed based on offers
            local_spotlight: spotlight || null,
            categories: phaseCategories,
            trending_tags: trendingTags.map((t: any) => t.tag_name),
            offer_chips: offerChips,
            restaurants: restaurants,
            ui_labels: uiLabels
        };
    }
}

export default new UiService();
