const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { response } = require("express");
const bcrypt = require("bcryptjs");
const Jdenticon = require("jdenticon");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { error } = require("console");

const userController = {
  register: async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({
        erorr: "Toate campurile sunt obligatorii.",
      });
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } }); // Facem req pe server pentru a vedea daca acest utilizator deja exista
      if (existingUser) {
        return res.status(400).json({ error: "Utilizatorul deja exista." });
      }

      const hashedPassword = await bcrypt.hash(password, 10); //Parola cu hash si salt

      const png = Jdenticon.toPng(name, 200); // generarea imaginii
      const avatarName = `${name}_${Date.now()}.png`;
      const avatarPath = path.join(__dirname, "../uploads", avatarName);
      const uploadsDir = path.join(__dirname, "../uploads"); // Calea relativă către folderul "uploads"

      // Verificăm dacă directorul "uploads" există și îl creăm dacă nu există
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      fs.writeFileSync(avatarPath, png); //Pentru a adauga user-ul in mapa uploads. writeFileSync -> asteapta pana ti se vor transmite

      //Dupa ce am verificat ca utilizatorul nu exista in baza de date, urmeaza:

      const user = await prisma.user.create({
        //create este o functie care va avea un obiect
        data: {
          email,
          password: hashedPassword,
          name,
          avatarUrl: `/uploads/${avatarName}`,
        },
      });

      res.json(user);
    } catch (err) {
      console.error("Error in register", err);
      res.status(500).json({ error: "Internal server error." });
      console.warn("Can't create the user.");
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ erorr: "Tote câmpurile sunt obligatorii!" });
    }
    try {
      //Cautam utilizatorul in baza de date
      const user = await prisma.user.findUnique({
        where: { email }, //deoarece email-ul este unic
      });
      if (!user) {
        return res.status(400).json({ error: "Login sau parolă greșită." });
      }
      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(400).json({ error: "Login sau parolă greșită." });
      }

      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY); //In token se cripteaza userId

      res.json({ token });
    } catch (err) {
      console.error("Login error.", err);
      res.status(500).json("Internal server error.");
    }
  },
  getUserById: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
      const user = await prisma.user.findUnique({
        //Cautam utilizatorul dupa id
        where: { id },
        include: {
          //Daca utilizatorul exista va returna si urmatoarele date
          followers: true,
          following: true,
        },
      });

      if (!user) {
        return res.status(404).json({ erorr: "Utilizatorul nu a fost gasit" });
      }

      // Проверяем, подписан ли текущий пользователь на пользователя
      const isFollowing = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId: id }],
        },
      });
      res.json({ ...user, isFollowing: Boolean(isFollowing) });
    } catch (err) {
      console.warn("Get current error.");

      res.status(500).json({ error: "Internal server error" });
    }
  },
  updateUser: async (req, res) => {
    const { id } = req.params;
    const { email, name, dateOfBirth, bio, location } = req.body;

    let filePath;

    //Vom incerca sa aflam daca exista fisierul, daca am primit fisierul, etc.
    if (req.file && req.filePath) {
      filePath = req.file.path;
    }

    //verificam daca utilizatorul modifica informatia
    if (id !== req.user.userId) {
      //Eroare deoarece n-am luat userId ci doar id
      return res.status(403).json({ error: "Nu aveti acces" });
    }

    try {
      if (email) {
        //Daca isi schimba email-ul
        const existingEmail = await prisma.user.findFirst({
          //findUnique lucreaza doar cu id-uri
          where: {
            email: email,
          },
        });
        if (existingUser && existingUser.id !== id) {
          //Daca id-ul utilizatoruli curent este diferit
          return res.status(400).json({
            erorr: "Emailul deja este utilizat.",
          });
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          email: email || undefined, //Daca n-am primit un email atunci ramande undefined(nu se schimba nimic)
          name: name || undefined,
          avatarUrl: filePath ? `/${filePath}` : undefined,
          dateOfBirth: dateOfBirth || undefined,
          bio: bio || undefined,
          location: location || undefined,
        },
      });

      res.json(user);
    } catch (err) {
      console.error("Update user error.", error);
      res.status(500).json({
        error: "Internal server error.",
      });
    }
  },
  current: async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.user.userId,
        },
        include: {
          followers: {
            include: {
              follower: true,
            },
          },
          following: {
            include: {
              following: true,
            },
          },
        },
      });
      if (!user) {
        return res.status(400).json({
          error: "Utilizatorul nu a fost gasit.",
        });
      }
      res.json(user);
    } catch (err) {
      console.error("Get Current Error", error);
      res.status(500).json({
        error: "Internal serveer error.",
      });
    }
  },
};

module.exports = userController;
