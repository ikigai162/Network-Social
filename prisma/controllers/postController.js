const { response } = require("express");
const { prisma } = require("../prismaClient");

const postController = {
  //Am creat un obiect cu functii care vor fi chemate
  createPost: async (req, res) => {
    const { content } = req.body;

    const authorId = req.user.userId;

    if (!content) {
      return res
        .status(400)
        .json({ error: "Toate campurile sunt obligatorii." });
    }

    try {
      const post = await prisma.post.create({
        //Am avut eroare la post, deoarece n-am importat prismaClient.js da @prisma/client
        data: {
          content,
          authorId,
        },
      });

      res.json(post);
    } catch (error) {
      console.error("Error in createPost:", error);

      res.status(500).json({ error: "There was an error creating the post" });
    }
  },
  getAllPosts: async (req, res) => {
    const userId = req.user.userId;

    try {
      const posts = await prisma.post.findMany({
        include: {
          likes: true,
          author: true,
          comments: true,
        },
        orderBy: {
          createdAt: "desc", // 'desc' означает сортировку по убыванию, т.е. новые посты будут первыми
        },
      });

      const postsWithLikeInfo = posts.map((post) => ({
        ...post,
        likedByUser: post.likes.some((like) => like.userId === userId),
      }));

      res.json(postsWithLikeInfo);
    } catch (err) {
      res.status(500).json({ error: "Произошла ошибка при получении постов" });
    }
  },
  getPostById: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          comments: {
            include: {
              user: true,
            },
          },
          likes: true,
          author: true,
        },
      });

      if (!post) {
        return res.status(404).json({ error: "Postarea nu a fost gasita." });
      }

      const postsWithLikeInfo = {
        post,
        likedByUser: post.likes.some((like) => like.userId == userId),
      };

      res.json(postsWithLikeInfo);
    } catch (err) {
      console.error("Get post by id.", err);

      res.status(500).json({
        error: "Internal server error.",
      });
    }
  },
  deletePost: async (req, res) => {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: {
        id,
      },
    });
    if (!post) {
      return res.status(400).json({ error: "Internal server error" });
    }
    if (post.authorId !== req.user.userId) { //Eroare deoarece am pus id in loc de userId
      return res.status(403).json({ error: "Nu aveti acces" });
    }
    try {
      const transaction = await prisma.$transaction([
        prisma.comment.deleteMany({ where: { postId: id } }),
        prisma.like.deleteMany({ where: { postId: id } }),
        prisma.post.deleteMany({ where: { id } }),
      ]);

      res.json(transaction);
    } catch (err) {
      console.error("Delete post error", err);

      return res.status(500).json({ error: "Internal server error." });
    }
  },
};

module.exports = postController;
