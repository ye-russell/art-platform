exports.getArtworks = (req, res) => {
  const artworks = [
    {
      id: 1,
      title: "Sunset",
      description: "A beautiful sunset.",
      artist: {
        id: 1,
        name: "John Doe",
        bio: "An abstract artist."
      },
    },
    {
      id: 2,
      title: "Mountain",
      description: "A majestic mountain.",
      artist: {
        id: 2,
        name: "Jane Smith",
        bio: "A landscape painter."
      },
    },
  ];
  res.json(artworks);
};

exports.addArtwork = (req, res) => {
  const artwork = req.body;
  res.json({ message: "Artwork added", artwork });
};
