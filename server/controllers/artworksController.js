exports.getArtworks = (req, res) => {
  res.json({ message: 'Fetch all artworks' });
};

exports.addArtwork = (req, res) => {
  const artwork = req.body;
  res.json({ message: 'Artwork added', artwork });
};