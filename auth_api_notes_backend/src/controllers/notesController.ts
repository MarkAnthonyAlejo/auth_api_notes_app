import { Request, Response } from "express"
import { supabase } from '../connection/supabaseClient';
import { AuthenticatedRequest } from '../types/user';

export const getNotes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ error: 'Unauthorized: missing user ID' });
        return;
    }

    try {
        const { data, error } = await supabase
            .from('notes') // your notes table
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error.message);
            res.status(500).json({ error: 'Failed to fetch notes' });
            return;
        }

        res.status(200).json({ notes: data });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Server error fetching notes' });
    }
}

export const createNotes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ error: 'Unauthorized: missing user ID' });
        return;
    }

    const { title, content } = req.body;

    if (!title || !content) {
        res.status(400).json({ error: 'Title and content are required' });
        return;
    }

    try {
        const { data, error } = await supabase
            .from('notes')
            .insert([
                {
                    user_id: userId,
                    title,
                    content,
                },
            ])
            .select(); // optionally return the inserted note

        if (error) {
            console.error('Supabase insert error:', error.message);
            res.status(500).json({ error: 'Failed to create note' });
            return;
        }

        res.status(201).json({ message: 'Note created successfully', note: data[0] });
    } catch (err) {
        console.error('Server error creating note:', err);
        res.status(500).json({ error: 'Server error creating note' });
    }
}

export const updateNotes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const noteId = req.params.id;
    console.log(noteId);
    console.log(userId);
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized: missing user ID' });
        return;
    }

    const { title, content } = req.body;

    if (!title || !content) {
        res.status(400).json({ error: 'Note ID, title, and content are required' });
        return;
    }

    try {
        const { data, error } = await supabase
            .from('notes')
            .update({
                title,
                content,
                updated_at: new Date().toISOString(),
            })
            .eq('id', noteId)
            .eq('user_id', userId)
            .select();

        if (error) {
            console.error('Supabase update error', error.message);
            res.status(500).json({ error: 'Failed to update note' });
            return;
        }

        if (!data || data.length == 0) {
            res.status(404).json({ error: 'Note not found or unauthorized' });
            return;
        }

        res.status(200).json({ message: 'Note updated successfully', note: (data as any[])[0] })
    } catch (err) {
        console.error('Server error updating note:', err);
        res.status(500).json({ error: 'Server error updating note' })
    }

}

export const deleteNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const noteId = req.params.id;

    if(!userId) {
        res.status(401).json({ error: 'Unauthorized: missing user ID'});
        return;
    }

    if (!noteId){
        res.status(400).json({ error: 'Note ID is required '});
        return;
    }

    try{
        const { data, error } = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId)
            .eq('user_id', userId)
            .select();

            if(error) {
                console.error('Supabase delete error:', error.message);
                res.status(500).json({ error: 'Failed to delete note'});
                return;
            }

            if(!data || data.length == 0) {
                res.status(404).json({ error: 'Note not found or unauthorized'});
                return;
            }

            res.status(200).json({ message: 'Note deleted successfully', note: data[0]})
    } catch (err) {
        console.error('Server error deleting note:', err);
        res.status(500).json({error: 'Server error deleting note'});
    }
}