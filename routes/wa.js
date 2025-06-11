const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { whatsapp } = require('../whatsapp-client'); // Anda perlu mengimplementasikan ini

// Get all WA connections
router.get('/', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM wa_connections');
        await connection.end();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new WA connection
router.post('/', async (req, res) => {
    const { phone_number, session_name } = req.body;
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'INSERT INTO wa_connections (phone_number, session_name) VALUES (?, ?)',
            [phone_number, session_name]
        );
        
        // Initialize WhatsApp session
        await whatsapp.initSession(session_name, phone_number);
        
        await connection.end();
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete WA connection
router.delete('/:id', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Get session info before deleting
        const [rows] = await connection.execute(
            'SELECT session_name FROM wa_connections WHERE id = ?',
            [req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Connection not found' });
        }
        
        // Delete from database
        await connection.execute(
            'DELETE FROM wa_connections WHERE id = ?',
            [req.params.id]
        );
        
        // Terminate WhatsApp session
        await whatsapp.terminateSession(rows[0].session_name);
        
        await connection.end();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
