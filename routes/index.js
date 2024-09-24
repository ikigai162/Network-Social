const express = require("express");
const router = express.Router(); //express.Router -> functie
const multer = require("multer");
const { userController, postController } = require("..");
const uploadDestination = "uploads";
const { authenticateToken } = require("../middleware/auth");

// Aratam unde trebuie salvata datele
const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const uploads = multer({ storage: storage }); // Prin const uploads utilizand multer a fost creata un depozit careia ia fost transmisa configuratia const storage

router.post("/register", userController.register); 
/* (req, res) => {
  // Cand este accesata route va fi indeplinita functia. req -> vine de la user, res -> raspunsul nostru
  res.send("Register"); // Am avut eroare deoarece n-am pus " "
} */

//Rute pentru utilizatori

router.post("/login", userController.login);
router.get("/current", authenticateToken, userController.current);
router.get("/users/:id", authenticateToken, userController.getUserById);
router.put("/users/:id", authenticateToken, uploads.single('avatar'), userController.updateUser);

//Rute pentru postari
router.post('/posts', authenticateToken, postController.createPost);
router.get('/posts', authenticateToken, postController.getAllPosts);
router.get('/posts/:id', authenticateToken, postController.getPostById); // Corectarea cu :id
router.delete('/posts/:id', authenticateToken, postController.deletePost); // Corectarea cu :id


module.exports = router;
