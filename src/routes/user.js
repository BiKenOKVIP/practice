const middlewareController = require("../controllers/middlewareController");
const userController = require("../controllers/userController");
const router = require("express").Router();

router.get(
  "/getAllUser",
  middlewareController.verifyToken,
  userController.getAllUsers
);
router.delete(
  "/deleteUser/:id",
  middlewareController.verifyTokenAndAdminAuth,
  userController.deleteUser
);
router.put("/updateUser/:id", userController.updateUser);
router.post("/insertUser", userController.insertUser);

module.exports = router;
