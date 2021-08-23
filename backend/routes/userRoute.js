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

router.get("/countCharactersInEmails", async (req, res) => {
  const users = await User.find({}, { _id: 0, email: 1 });
  if (users.length) {
    let counting = {};
    users.forEach(({ email }) => {
      let repeated = [];
      for (let i = 0; i < email.length; i++) {
        const character = email[i].toUpperCase();
        const regex = new RegExp("[" + character + "]", "g");
        if (!repeated.find((r) => r === character)) {
          repeated.push(character);
          if (counting[character]) {
            counting[character] += email.toUpperCase().match(regex).length;
          } else {
            console.log(email, character);
            counting[character] = email.toUpperCase().match(regex).length;
          }
        }
      }
    });
    res.status(200).send(counting);
  } else {
    res.status(400).send({
      error: true,
      message: "No users to work!",
    });
  }
});

router.get("/possibleDuplication/:emailToMatch", async (req, res) => {
  const emailToMatch = req.params.emailToMatch;

  const emailVerification = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  const separators = /[_|-|.]/g;
  if (!emailVerification.test(emailToMatch)) {
    res.status(400).send({ message: "Invalid email." });
    return;
  }

  let users = await User.find({}, { _id: 0, email: 1 });

  const firstPartEmail = emailToMatch.slice(0, emailToMatch.indexOf("@"));
  let noSeparators = firstPartEmail.split(separators);
  if (noSeparators.length === 0) {
    noSeparators = [firstPartEmail];
  }

  let possibleDuplication = [];

  noSeparators.forEach((phrase) => {
    const userObj = users.find((u) => u.email.includes(phrase));
    if (userObj) {
      users = users.filter((u) => u !== userObj);
      possibleDuplication.push(userObj.email);
    }

    if (phrase.length > 4) {
      for (let i = 4; i < phrase.length; i++) {
        const newPhrase = phrase.slice(0, i);
        const arrPD = users.filter((u) => u.email.includes(newPhrase));
        arrPD.forEach((apd) => {
            users = users.filter((u) => u !== apd);
            possibleDuplication.push(apd.email);
        });
      }

      for (let i = phrase.length - 4; i >= 0; i--) {
        const newPhrase = phrase.slice(i, phrase.length);
        const arrPD = users.filter((u) => u.email.includes(newPhrase));
        arrPD.forEach((apd) => {
            users = users.filter((u) => u !== apd);
            possibleDuplication.push(apd.email);
        });
      }
    }
  });

  res.status(200).send(possibleDuplication);
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
