const userController = require('./prisma/controllers/userController.js')
const postController = require('./prisma/controllers/postController.js')
const commentController = require('./prisma/controllers/commentsController.js')
const likeController = require('./prisma/controllers/likeController.js')
const followController = require('./prisma/controllers/followController.js')

module.exports = {
    userController,
    postController,
    commentController,
    likeController,
    followController
}