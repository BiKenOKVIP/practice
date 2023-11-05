const User = require("../models/User");
const bcrypt = require("bcrypt");

const userController = {
  getPaging: async (req, res) => {
    try {
      const users = await User.find().skip;
    } catch (error) {}
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await User.find({ isAdmin: false });

      const message =
        users.length > 0
          ? "Lấy tất cả user thành công!!!"
          : "Danh sách user rỗng!!!";

      res.status(200).json({
        status: 200,
        message,
        data: users,
      });
    } catch (error) {
      res.status(404).json({ error: "Lấy danh sách user thất bại!!!" });
    }
  },

  updateUser: async (req, res) => {
    try {
      const currentTime = new Date();
      const year = currentTime.getFullYear();
      const month = (currentTime.getMonth() + 1).toString().padStart(2, "0");
      const day = currentTime.getDate().toString().padStart(2, "0");
      const hours = currentTime.getHours().toString().padStart(2, "0");
      const minutes = currentTime.getMinutes().toString().padStart(2, "0");
      const seconds = currentTime.getSeconds().toString().padStart(2, "0");

      const formattedTime = `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;

      const updateUser = { updateTime: formattedTime, ...req.body };

      if (updateUser.password) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(updateUser.password, salt);
        updateUser.password = hashed;
      }

      const user = await User.findOneAndUpdate(
        { _id: req.params.id },
        updateUser
      );

      const { password, _id, createdAt, updatedAt, __v, ...update } = user._doc;
      if (!user) {
        return res
          .status(404)
          .json({ status: 404, error: "User không tồn tại!!!", user: null });
      } else {
        return res.status(200).json({
          status: 200,
          message: "Update user thành công!!!",
          updateData: update,
        });
      }
    } catch (error) {
      res
        .status(404)
        .json({ status: 404, error: "User không tồn tại!!!", user: null });
    }
  },

  insertUser: async (req, res) => {
    console.log("insertUser");
    try {
      const accountExists = await User.findOne({ username: req.body.username });
      if (accountExists) {
        return res.status(500).json({
          status: 500,
          message: "Username này đã tồn tại!!!",
          accountExists: accountExists,
        });
      }

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

      return res.status(200).json({
        status: 200,
        message: "Thêm user thành công!!!",
        user: user,
      });
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

  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      return res.status(200).json({
        status: user ? 200 : 404,
        message: user ? "Xóa user thành công!!!" : "Xóa user thất bại!!!",
        user: user ? user : null,
      });
    } catch (error) {
      res
        .status(404)
        .json({ status: 404, error: "User không tồn tại!!!", user: null });
    }
  },
};

module.exports = userController;
