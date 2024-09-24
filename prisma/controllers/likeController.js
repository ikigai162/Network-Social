const { response, request } = require("express");
const { prisma } = require("../prismaClient");

const likeController = {
  likePost: async (req, res) => {
    const { postId } = req.body; //Eroare: "postId" in loc de "{ postId }""
    const userId = req.user.userId;

    if (!postId) {
      return res
        .status(400)
        .json({ error: "Toate campurile sunt obligatorii" });
    }
    try {
      const existentLike = await prisma.like.findFirst({
        where: { postId, userId },
      });

      if (existentLike) {
        res.status(400).json({ error: "Deja ati apreciat postarea" });
      }
      const like = await prisma.like.create({
        data: { postId, userId },
      });

      res.json(like);
    } catch (err) {
      console.error("Error like post", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  unlikePost: async (req, res) => {
    const { id } = req.params;
    const userId = req.body.userId;
    const { postId } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Deja ati dat dislike" });
    }

    try {
      const existentLike = await prisma.like.findFirst({
        where: { postId: id, userId },
      });

      if (!existentLike) {
        return res.status(400).json({ error: "Like deja exista" });
      }

      const like = await prisma.like.deleteMany({
        where: { postId: id, userId },
      });

      res.json(like);
    } catch (err) {
      console.error("Error unlike post", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = likeController;
