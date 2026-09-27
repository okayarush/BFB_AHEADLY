const express = require('express');
const { addClient, removeClient } = require('../services/sseBus');

const router = express.Router();

router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = addClient(res);
  res.write('event: connected\n');
  res.write(`data: ${JSON.stringify({ ok: true, clientId })}\n\n`);

  req.on('close', () => {
    removeClient(clientId);
  });
});

module.exports = router;
