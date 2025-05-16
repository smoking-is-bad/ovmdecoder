const express = require('express');
const router = express.Router();
const decoder = require('./decoder');  // Adjust path as needed

router.post('/decode', (req, res) => {
  const { fPort, bytes } = req.body;

  try {
    const decoded = decoder.decodeUplink({ fPort, bytes });
    res.json(decoded);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
