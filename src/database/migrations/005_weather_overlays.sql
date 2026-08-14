-- Weather overlays that change UI copy/colors when admin selects Rain / Heat / Cold / Normal

CREATE TABLE IF NOT EXISTS weather_overlays (
    id VARCHAR(50) PRIMARY KEY, -- normal, rain, heatwave, cold
    label VARCHAR(100) NOT NULL,
    emoji VARCHAR(20),
    tone TEXT,
    greeting_line1 VARCHAR(255),
    greeting_line2 VARCHAR(255),
    phase_sub VARCHAR(255),
    search_hint VARCHAR(255),
    banner JSONB,
    offer_chips TEXT[],
    color_overrides JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS city_weather_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id VARCHAR(50) NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    weather_id VARCHAR(50) NOT NULL REFERENCES weather_overlays(id) ON DELETE CASCADE,
    line1 VARCHAR(255) NOT NULL,
    line2 VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(city_id, weather_id)
);
