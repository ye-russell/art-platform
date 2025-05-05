exports.getArtists = (req, res) => {
  const artists = [
    { id: 1, name: "John Doe", bio: "An abstract artist." },
    { id: 2, name: "Jane Smith", bio: "A landscape painter." },
  ];
  res.json(artists);
};

exports.addArtist = (req, res) => {
  const artist = req.body;
  res.json({ message: "Artist added", artist });
};
