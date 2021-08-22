import express from "express";
import User from "../models/userModel";

const router = express.Router();

router.post("/add", async (req, res) => {
  const user = new User({
    ...req.body,
  });
  const newUser = await user.save();

  if (newUser) {
    res.status(200).send({
      message: `New user '${newUser.name}' with id: '${newUser._id}' was registered correctly`,
    });
    return;
  }
  res.status(500).send({
    error: true,
    message: "Something went wrong",
  });
});

export default router;
