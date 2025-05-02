const express = require('express');
const { getArtists, addArtist } = require('../controllers/artistsController');

const router = express.Router();

router.get('/', getArtists);
router.post('/', addArtist);

module.exports = router;