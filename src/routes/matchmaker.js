const express = require('express');
const router = express.Router();

// Simple MMS emulation
router.get('/waitingroom/api/waitingroom', (req, res) => res.status(204).end());

router.post('/fortnite/api/matchmaking/session/matchMakingRequest', (req, res) => {
  const ticketId = require('uuid').v4();
  res.json({
    ticketType: "mms-player",
    payload: Buffer.from(JSON.stringify({ ticketId, bucketId: req.body.bucketId || "38460347:0:EU:0" })).toString('base64'),
    signature: "keylix_sig"
  });
});

router.get('/fortnite/api/matchmaking/session/findPlayer/:accountId', (req, res) => res.json([]));

module.exports = router;
