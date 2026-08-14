-- schema.sql
-- Run this script in your Supabase SQL Editor to create the schema

-- 1. Cities
CREATE TABLE cities (
    id VARCHAR(50) PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    accent_color VARCHAR(50),
    accent_light VARCHAR(50),
    is_pure_veg_market BOOLEAN DEFAULT false,
    language_locale VARCHAR(100),
    language_script VARCHAR(100),
    language_style VARCHAR(255),
    language_tagline VARCHAR(255),
    search_placeholder VARCHAR(255),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. City Greetings
CREATE TABLE city_greetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id VARCHAR(50) NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    phase_id VARCHAR(50) NOT NULL, -- morning, afternoon, evening, night
    line1 VARCHAR(255) NOT NULL,
    line2 VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(city_id, phase_id)
);

-- 3. City Salary Messages
CREATE TABLE city_salary_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id VARCHAR(50) NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    salary_cycle_id VARCHAR(50) NOT NULL, -- premium, savings
    message VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(city_id, salary_cycle_id)
);

-- 4. Local Spotlights
CREATE TABLE local_spotlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id VARCHAR(50) NOT NULL REFERENCES cities(id) ON DELETE CASCADE UNIQUE,
    emoji VARCHAR(10) NOT NULL,
    title VARCHAR(255) NOT NULL,
    sub VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. UI Labels
CREATE TABLE ui_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id VARCHAR(50) NOT NULL REFERENCES cities(id) ON DELETE CASCADE UNIQUE,
    offers_section VARCHAR(100),
    categories_section VARCHAR(100),
    trending_section VARCHAR(100),
    nearby_section VARCHAR(100),
    filter_btn VARCHAR(100),
    see_all VARCHAR(100),
    view_all VARCHAR(100),
    order_btn VARCHAR(100),
    explore_btn VARCHAR(100),
    save_btn VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. City Categories
CREATE TABLE city_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id VARCHAR(50) NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    phase_id VARCHAR(50) NOT NULL, -- morning, afternoon, evening, night
    emoji VARCHAR(10) NOT NULL,
    label VARCHAR(100) NOT NULL,
    filter_value VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Trending Tags
CREATE TABLE trending_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id VARCHAR(50) NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    tag_name VARCHAR(255) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Restaurants
CREATE TABLE restaurants (
    id VARCHAR(50) PRIMARY KEY,
    city_id VARCHAR(50) NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    emoji VARCHAR(10),
    name VARCHAR(255) NOT NULL,
    rating VARCHAR(10),
    time VARCHAR(50),
    cuisine VARCHAR(100),
    discount VARCHAR(100),
    is_veg BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Day Phases
CREATE TABLE day_phases (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    hours VARCHAR(50) NOT NULL,
    mood VARCHAR(255),
    colors JSONB,
    weather_icon VARCHAR(10),
    phase_label VARCHAR(255),
    phase_sub VARCHAR(255),
    default_offers TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Salary Cycles
CREATE TABLE salary_cycles (
    id VARCHAR(50) PRIMARY KEY,
    trigger_days JSONB,
    label VARCHAR(100),
    tone VARCHAR(255),
    avatar_ring_color VARCHAR(50),
    avatar_ring_label VARCHAR(50),
    banner JSONB,
    offer_chips TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Festival Overlays (calendar-based; city_id NULL = all cities)
CREATE TABLE festival_overlays (
    id VARCHAR(50) PRIMARY KEY,
    active BOOLEAN DEFAULT false,
    enabled BOOLEAN DEFAULT true,
    start_date DATE,
    end_date DATE,
    city_id VARCHAR(50) REFERENCES cities(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 0,
    detection VARCHAR(255),
    color_overrides JSONB,
    banner JSONB,
    offer_chips TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Festival Categories
CREATE TABLE festival_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_id VARCHAR(50) REFERENCES festival_overlays(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    label VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Festival Greetings
CREATE TABLE festival_greetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_id VARCHAR(50) REFERENCES festival_overlays(id) ON DELETE CASCADE,
    city_id VARCHAR(50) NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    greeting VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(festival_id, city_id)
);

-- 14. Resolver Configuration
CREATE TABLE resolver_configuration (
    id SERIAL PRIMARY KEY,
    priority TEXT[],
    note TEXT,
    weather_triggers JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. System Metadata
CREATE TABLE system_metadata (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Weather overlays (Normal / Rain / Heat / Cold)
CREATE TABLE weather_overlays (
    id VARCHAR(50) PRIMARY KEY,
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

CREATE TABLE city_weather_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id VARCHAR(50) NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    weather_id VARCHAR(50) NOT NULL REFERENCES weather_overlays(id) ON DELETE CASCADE,
    line1 VARCHAR(255) NOT NULL,
    line2 VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(city_id, weather_id)
);
