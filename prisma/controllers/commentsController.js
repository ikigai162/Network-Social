const { response } = require("express");
const { prisma } = require("../prismaClient");

const commentController = {
  createComment: async (req, res) => {
    try {
      const { postId, content } = req.body;
      const userId = req.user.userId;

      if (!postId || !content) {
        return res.status(400).json({ error: "Все поля обязательны" });
      }

      const comment = await prisma.comment.create({
        data: {
          postId,
          userId,
          content,
        },
      });

      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Не удалось создать комментарий" });
    }
  },
  deleteComment: async (req, res) => {
    const { id } = req.params;
    const userId = req.body.userId;

    try {
      const comment = await prisma.comment.findUnique({ where: { id } });

      if (!comment) {
        return res.status(404).json({ error: "Comentariul nu a fost gasit" });
      }

      if (comment.userId !== userId) {
        return res.status(403).json({ error: "Nu aveti acces" });
      }

      await prisma.comment.delete({ where: { id } });

      res.json(comment);
    } catch (err) {
      console.error("Error deleting comment", err);
      res.status(500).json({ error: "Internal server error." });
    }
  },
};

module.exports = commentController;
