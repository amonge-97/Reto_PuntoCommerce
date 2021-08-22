import express from "express";
import User from "../models/userModel.js";

const router = express.Router();

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

export default router;
