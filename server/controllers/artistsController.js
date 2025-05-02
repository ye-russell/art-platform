exports.getArtists = (req, res) => {
  res.json({ message: 'Fetch all artists' });
};

exports.addArtist = (req, res) => {
  const artist = req.body;
  res.json({ message: 'Artist added', artist });
};