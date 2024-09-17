const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    //Verificam token-ul pe care l-am primit de la utilizator
    if (err) {
      return res.status(303).json({
        error: "Invalid token",
      });
    }

    req.user = user;

    next();
  }); //Eroare, nu-mi dadea la current deoarece paranteza verify n-am pus-o la locul potrivit
};

module.exports = { authenticateToken }; //Am avut eroare deoarece n-am pus {}
