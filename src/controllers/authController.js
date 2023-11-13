const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let refreshTokens = [];
const authController = {
  registerUser: async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);
      const newUser = await new User({
        username: req.body.username,
        email: req.body.email,
        fullName: req.body.fullName,
        isAdmin: req.body.isAdmin,
        password: hashed,
      });

      const user = await newUser.save();

      return res
        .status(200)
        .json({ status: 200, message: "Đăng ký thành công!!!", user });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error?.keyValue?.email
          ? "Email này đã tồn tại!!!"
          : error?.keyValue?.username
          ? "Username này đã tồn tại!!!"
          : "",
        error: error,
      });
    }
  },

  generateAccessToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.isAdmin,
      },
      process.env.SECRET_KEY,
      { expiresIn: "30m" }
    );
  },

  generateRefreshToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.isAdmin,
      },
      process.env.REFRESH_KEY,
      { expiresIn: "100d" }
    );
  },

  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });

      if (!user) {
        return res
          .status(404)
          .json({ status: 404, message: "User không tồn tại!!!", user: null });
      }

      const isValidPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (!isValidPassword) {
        return res
          .status(404)
          .json({ status: 404, message: "Password sai!!!", user: null });
      }

      if (isValidPassword && user) {
        const accessToken = authController.generateAccessToken(user);
        const refreshToken = authController.generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });

        return res.status(200).json({
          status: 200,
          message: "Đăng nhập thành công!!!",
          user,
          accessToken,
        });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  },

  requestRefreshToken: async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(401).json("Chưa được xác thực");

    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json("Refresh token không hợp lệ!!!");
    }

    jwt.verify(refreshToken, process.env.REFRESH_KEY, (err, user) => {
      if (err) {
        return err;
      }
      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
      const newAccessToken = authController.generateAccessToken(user);
      const newRefreshToken = authController.generateRefreshToken(user);
      refreshTokens.push(newRefreshToken);
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });
      return res.status(200).json({ accessToken: newAccessToken });
    });
  },

  logoutUser: async (req, res) => {
    res.clearCookie("refreshToken");
    refreshTokens = refreshTokens.filter(
      (token) => token !== req.cookies.refreshToken
    );
    return res.status(200).json("Đăng xuất thành công!!!");
  },
};

module.exports = authController;
