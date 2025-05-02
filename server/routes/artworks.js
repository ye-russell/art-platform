const express = require('express');
const { getArtworks, addArtwork } = require('../controllers/artworksController');

const router = express.Router();

router.get('/', getArtworks);
router.post('/', addArtwork);

module.exports = router;