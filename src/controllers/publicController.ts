import { Request, Response } from 'express';
import supabase from '../config/supabase';

export const getCities = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase.from('cities').select('*');
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCategories = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase.from('city_categories').select('*');
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getRestaurants = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase.from('restaurants').select('*');
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getDayPhases = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase.from('day_phases').select('*');
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getSalaryCycles = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase.from('salary_cycles').select('*');
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getFestivals = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase.from('festival_overlays').select('*');
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllData = async (req: Request, res: Response) => {
    try {
        const [
            citiesRes, categoriesRes, restaurantsRes, 
            dayPhasesRes, salaryCyclesRes, festivalsRes
        ] = await Promise.all([
            supabase.from('cities').select('*'),
            supabase.from('city_categories').select('*'),
            supabase.from('restaurants').select('*'),
            supabase.from('day_phases').select('*'),
            supabase.from('salary_cycles').select('*'),
            supabase.from('festival_overlays').select('*')
        ]);

        // Check for any errors
        const errors = [citiesRes, categoriesRes, restaurantsRes, dayPhasesRes, salaryCyclesRes, festivalsRes]
            .map(res => res.error)
            .filter(err => err !== null);
            
        if (errors.length > 0) throw errors[0];

        res.status(200).json({
            success: true,
            data: {
                cities: citiesRes.data,
                categories: categoriesRes.data,
                restaurants: restaurantsRes.data,
                day_phases: dayPhasesRes.data,
                salary_cycles: salaryCyclesRes.data,
                festivals: festivalsRes.data
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
