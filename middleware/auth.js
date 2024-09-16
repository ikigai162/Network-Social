const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Unathorized",
    });
  }

  jwt.verify(token, process.env.SECRET_KEY),
    (req, res) => {
      //Verificam token-ul pe care l-am primit de la utilizator
      if (err) {
        return res.status(303).json({
          error: "Invalid token",
        });
      }

      req.user = user;

      next();
    };
};

module.exports = { authenticateToken }; //Am avut eroare deoarece n-am pus {}
