const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');

// GET /api/hri/ward-risk/:id
router.get('/ward-risk/:id', (req, res) => {
    const wardId = req.params.id;
    
    // Call the Python script in the data-processing folder
    const pythonProcess = spawn('python', [
        path.join(__dirname, '../../data-processing/calculate_ward_hri.py'), 
        wardId
    ]);

    pythonProcess.stdout.on('data', (data) => {
        try {
            const result = JSON.parse(data.toString());
            res.json({
                wardId: wardId,
                hri_score: result.score,
                status: result.category,
                color: result.color,
                recommendation: result.action // Meets "Explainable Decision Logic" requirement
            });
        } catch (e) {
            res.status(500).json({ error: "Failed to process HRI calculation" });
        }
    });
});

module.exports = router;