import { Request, Response } from 'express';
import supabase from '../config/supabase';

const PROTECTED_FIELDS = ['id', 'created_at', 'updated_at'];

const removeProtectedFields = (body: any) => {
    const data = { ...body };
    PROTECTED_FIELDS.forEach(field => delete data[field]);
    return data;
};

// Generic create handler
export const createResource = (table: string) => async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase.from(table).insert(req.body).select();
        if (error) throw error;
        res.status(201).json({ success: true, message: 'Resource created successfully.', data: data[0] });
    } catch (error: any) {
        res.status(400).json({ success: false, message: 'Validation failed.', errors: [error.message] });
    }
};

// Generic update handler
export const updateResource = (table: string) => async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = removeProtectedFields(req.body);
        
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields provided for update.' });
        }

        const { data, error } = await supabase.from(table).update(updateData).eq('id', id).select();
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(404).json({ success: false, message: 'Resource not found.' });
        }
        res.status(200).json({ success: true, message: 'Resource updated successfully.', data: data[0] });
    } catch (error: any) {
        res.status(400).json({ success: false, message: 'Update failed.', errors: [error.message] });
    }
};

// Generic delete handler
export const deleteResource = (table: string) => async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        res.status(200).json({ success: true, message: 'Resource deleted successfully.', data: {} });
    } catch (error: any) {
        res.status(400).json({ success: false, message: 'Delete failed. Dependent records might exist.', errors: [error.message] });
    }
};
