import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import insertDecodedMessage from './insertData.js';
import decode from './decoder/decoder.js';
import './cron/scheduleMigration.js';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
app.get('/', (req, res) => {
  res.send('ResIOT Decoder Server is running');
});

wss.on('connection', function connection(ws) {
  console.log('🔌 WebSocket connected');

  ws.on('message', async function incoming(message) {
    try {
      const json = JSON.parse(message.toString());

      const devEUI = json.DevEui;
      const fPort = parseInt(json.Port, 10);
      const payloadHex = json.Payload;
      const timestamp = json.DT;

      const bytes = Buffer.from(payloadHex, 'hex');
      const decodedResult = decode.decodeUplink({ fPort, bytes });

      if (decodedResult?.data) {
        await insertDecodedMessage(devEUI, decodedResult.data, timestamp);
        console.log(`✅ Inserted message from DevEUI ${devEUI} at ${timestamp}`);
      } else {
        console.warn(`⚠️ Failed to decode message from ${devEUI}`);
      }
    } catch (err) {
      console.error('❌ Error processing message:', err);
    }
  });
});

const port = process.env.PORT || 3080; // Change this to 3080
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
