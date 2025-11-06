const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ quiet: true });

const PORT = process.env.PORT || 3000;
const IP = ["localhost", process.env.IP]
const IP_SELECT = 0

const app = express();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Increase body size limit
app.use(bodyParser.json({ limit: '50mb' })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.post('/publish', (req, res) => {
  const { pathname, html } = req.body;
  const dir = path.join(__dirname, 'public', pathname);

  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write HTML file
  const filePath = path.join(dir, 'index.html');
  fs.writeFile(filePath, html, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error saving file.');
    } else {
      res.send(`Site published at /${pathname}`);
    }
  });
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, IP[IP_SELECT], () => {
  console.log(`Server running on http://${IP[IP_SELECT]}:${PORT}`);
});

// Listen for terminal input to close the server
rl.on('line', (input) => {
  if (input.toLowerCase() === 'stop') {
    console.log('Server closed.');
    process.exit(0);
  }
});