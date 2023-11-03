const userController = require("../controllers/userController");
const router = require("express").Router();

router.get("/getAllUser", userController.getAllUsers);
router.delete("/deleteUser/:id", userController.deleteUser);
router.put("/updateUser/:id", userController.updateUser);
router.post("/insertUser", userController.insertUser);

module.exports = router;
