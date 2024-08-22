const jwt = require("jsonwebtoken");
const { User, Role } = require("../models");

module.exports = {
  authenticate: async (req, res, next) => {
    try {
      const token =
      req.cookies.token ||
        req.headers["authorization"] &&
        req.headers["authorization"].split(" ")[1];
      if (!token) {
        return res.status(403).json({
          status: "error",
          statuscode: 403,
          data: {
            result: "No token provided",
          },
        });
      }

      const decoded = await jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
      next();
    } catch (err) {
      res.status(401).json({
        status: "error",
        statuscode: 401,
        data: {
          result: "Failed to authenticate token",
        },
      });
    }
  },

  authorize: (role) => {
    return async (req, res, next) => {
      try {
        const user = await User.findByPk(req.userId, { include: Role });
        if (user && user.Role.name === role) {
          next();
        } else {
          res.status(403).json({
            status: "error",
            statuscode: 403,
            data: {
              result: "You do not have permission to perform this action",
            },
          });
        }
      } catch (err) {
        res.status(500).json({
          status: "error",
          statuscode: 500,
          data: {
            result: "Internal server error",
          },
        });
      }
    };
  },
};
