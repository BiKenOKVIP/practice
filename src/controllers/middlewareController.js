const jwt = require("jsonwebtoken");

const middlewareController = {
  verifyToken: (req, res, next) => {
    const token = req.headers["authorization"];
    if (token) {
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, process.env.SECRET_KEY, (err, user) => {
        if (err) {
          return res.status(403).json("Token không hợp lệ!!!");
        }
        req.user = user;
        next();
      });
    } else {
      return res.status(401).json("Chưa được xác thực!!!");
    }
  },

  verifyTokenAndAdminAuth: (req, res, next) => {
    middlewareController.verifyToken(req, res, () => {
      if (req.user.id === req.params.id || req.user.admin) {
        next();
      } else {
        return res.status(403).json("Bạn không có quyền xóa người khác!!!");
      }
    });
  },
};

module.exports = middlewareController;
