const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Get all auto replies
router.get('/', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM auto_replies');
        await connection.end();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new auto reply
router.post('/', async (req, res) => {
    const { trigger_keyword, reply_text, is_active } = req.body;
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'INSERT INTO auto_replies (trigger_keyword, reply_text, is_active) VALUES (?, ?, ?)',
            [trigger_keyword, reply_text, is_active]
        );
        await connection.end();
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update auto reply
router.put('/:id', async (req, res) => {
    const { trigger_keyword, reply_text, is_active } = req.body;
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE auto_replies SET trigger_keyword = ?, reply_text = ?, is_active = ? WHERE id = ?',
            [trigger_keyword, reply_text, is_active, req.params.id]
        );
        await connection.end();
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete auto reply
router.delete('/:id', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM auto_replies WHERE id = ?', [req.params.id]);
        await connection.end();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Handle incoming message and send auto reply if matched
router.post('/check', async (req, res) => {
    const { message } = req.body;
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM auto_replies WHERE ? LIKE CONCAT("%", trigger_keyword, "%") AND is_active = TRUE',
            [message]
        );
        
        if (rows.length > 0) {
            // Get counts for dynamic replies
            if (rows[0].trigger_keyword.toUpperCase() === 'LAPORAN SUNSCREEN') {
                const [sunscreenCount] = await connection.execute('SELECT COUNT(*) as count FROM sunscreen');
                rows[0].reply_text = rows[0].reply_text.replace('{count}', sunscreenCount[0].count);
            }
            // Add similar replacements for other reports
            
            res.json({ shouldReply: true, reply: rows[0].reply_text });
        } else {
            res.json({ shouldReply: false });
        }
        
        await connection.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
