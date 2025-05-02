const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const artworksRoutes = require('./routes/artworks');
const artistsRoutes = require('./routes/artists');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/artworks', artworksRoutes);
app.use('/api/artists', artistsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Art Platform API');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});