import express from "express";
import User from "../models/userModel.js";

const router = express.Router();

router.get("/all", async (req, res) => {
  const users = await User.find();
  if (users) {
    var allUsers = [];
    users.forEach((user) => {
      const { __v, ...rest } = user._doc;
      allUsers.push({ ...rest });
    });
    res.status(200).send(allUsers);
  }
});

router.post("/add", async (req, res) => {
  const user = new User({
    ...req.body,
  });
  const newUser = await user.save().catch(({ code, keyValue }) => {
    if (code === 11000) {
      res.status(409).send({ error: true, message: "Duplicate key", keyValue });
      return;
    }
    res.status(500).send({
      error: true,
      message: "Something went wrong",
    });
  });
  if (newUser) {
    res.status(200).send({
      message: `New user '${newUser.name}' with id: '${newUser._id}' was registered correctly`,
    });
    return;
  }
});

router.put("/modify/:id", async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
  if (user) {
    user.name = req.body.name || user.name;
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.status = req.body.status || user.status;
    const updatedUser = await user.save().catch(({ code, keyValue }) => {
      if (code === 11000) {
        res
          .status(409)
          .send({ error: true, message: "Duplicate key", keyValue });
        return;
      }
      res.status(500).send({
        error: true,
        message: "Something went wrong",
      });
    });
    if (updatedUser) {
      res.status(200).send({
        message: "User updated",
        user: { ...updatedUser },
      });
    }
  } else {
    res.send({ message: "User not found", error: true });
  }
});

router.delete("/delete/:id", async (req, res) => {
  const deleteUser = await User.findById(req.params.id);
  if (deleteUser) {
    await deleteUser.remove();
    res.send({ message: "User deleted" });
  } else {
    res.send({ message: "User not found", error: true });
  }
});

export default router;
