const { connect } = require("../../routes");
const { prisma } = require("../prismaClient");

const followController = {
  followUser: async (req, res) => {
    const userId = req.user.userId;
    const { followingId } = req.body;
    const { id } = req.params;

    if (followingId === userId) {
      return res
        .status(500)
        .json({ error: "Nu puteti sa va urmariti pe dumneavoastra" });
    }

    try {
      const existingSubscription = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId }],
        },
      });

      if (existingSubscription) {
        return res.status(500).json({ error: "Deja sunteti abonat" });
      }

      await prisma.follows.create({
        data: {
          follower: { connect: { id: userId } }, //Eroare. Dupa id trenuie ":"
          following: { connect: { id: followingId } },
        },
      });

      res.status(201).json({ message: "Sunteti abonat" });
    } catch (err) {
      console.error("Follow error", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  unFollowUser: async (req, res) => {
    const { followingId } = req.body;
    const userId = req.user.userId;

    try {
      const follows = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId }],
        },
      });

      if (!follows) {
        return res
          .status(404)
          .json({ error: "Nu sunteti abonat la acest utilizator." });
      }

      await prisma.follows.delete({
        where: {
          id: follows.id,
        },
      });
      res.status(201).json({ message: "Vati dezabonat" });
    } catch (err) {
      console.error("Unfollow error", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = followController;
