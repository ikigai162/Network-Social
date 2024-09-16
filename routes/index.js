const express = require("express");
const router = express.Router(); //express.Router -> functie
const multer = require("multer");
const { userController } = require("..");
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
router.post("/login", userController.login);
router.get("/current", authenticateToken, userController.current);
router.post("/users/:id", userController.login);
router.put("/users/:id", userController.updateUser);

module.exports = router;
