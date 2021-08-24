import express from "express";
import User from "../models/userModel.js";
import { bubbleSort_JSON } from "../utils.js"
const router = express.Router();

router.get("/all", async (req, res) => { // Step #1 Get all users and send basic data
  const users = await User.find();
  if (users) {
    var allUsers = [];
    users.forEach((user) => {
      const { __v, _id: id, ...rest } = user._doc; // Separate data that is not required
      allUsers.push({ ...rest, id });
    });
    res.status(200).send(allUsers);
  }
});

router.get("/countCharactersInEmails", async (req, res) => { // Step #2 Quantifies each character on the email's field from users. 
  const users = await User.find({}, { _id: 0, email: 1 });  
  if (users.length) {
    let counting = {}; //Final count
    users.forEach(({ email }) => {
      let repeated = [];
      for (let i = 0; i < email.length; i++) {
        const character = email[i].toUpperCase(); 
        const regex = new RegExp("[" + character + "]", "g"); // Using RegEx to count the number of matches on the email.
        if (!repeated.find((r) => r === character)) { // If the current letter is not counted on this email. 
          repeated.push(character); // Added to the list to avoid repeat the count.
          if (counting[character]) { // If the final count has already the current letter
            counting[character] += email.toUpperCase().match(regex).length; // Just add the value with the number of matches that the regex found.
          } else { 
            counting[character] = email.toUpperCase().match(regex).length; // Create a new key with the letter and add as a value the number of matches that the regex found.
          }
        }
      }
    });
    counting = bubbleSort_JSON(counting); //Sorting the final count with bubble.
    res.status(200).send(counting);
  } else { // There are not users on the collection
    res.status(400).send({
      error: true,
      message: "No users to work!",
    });
  }
});

router.get("/possibleDuplication/:emailToMatch", async (req, res) => { // Step #3 Get possibly duplicate emails
  const emailToMatch = req.params.emailToMatch;

  const emailVerification = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g; // Using this RegEx to allow only valid emails
  const separators = /[_|-|.]/g; // This RegEx is to separate the words of the email that contains '- _ .'
  if (!emailVerification.test(emailToMatch)) {
    res.status(400).send({ message: "Invalid email." });
    return;
  }

  let users = await User.find({}, { _id: 0, email: 1 });

  const firstPartEmail = emailToMatch.slice(0, emailToMatch.indexOf("@")); // Just working with the first part of the email, until the '@' separator.
  let noSeparators = firstPartEmail.split(separators);// Returns an array of separated words
  if (noSeparators.length === 0) {
    noSeparators = [firstPartEmail]; //If there are no separators on the email, just create an array (with just one element) that contains the whole word.
  }

  let possibleDuplication = []; // Final array

  noSeparators.forEach((phrase) => { // Work with each word of the email
    const arrPD = users.filter((u) => u.email.includes(phrase)); //First try to find emails with the whole word.
    arrPD.forEach((apd) => {
      users = users.filter((u) => u !== userObj); // If there are a match, remove it from all candidates (emails).
      possibleDuplication.push(userObj.email); // And add to the final Array, this is a possible duplicate email.
    })

    if (phrase.length > 4) { // If the current word has more than 4 letters 
      for (let i = 4; i < phrase.length; i++) { // Cuting the word from begining to the end - 1 to find more matches, example: HolaMundo (Hola, HolaM, HolaMu, HolaMun, HolaMund).
        const newPhrase = phrase.slice(0, i); // Cuting the word.
        const arrPD2 = users.filter((u) => u.email.includes(newPhrase));
        arrPD2.forEach((apd) => { // Same process to add a match 
            users = users.filter((u) => u !== apd);
            possibleDuplication.push(apd.email);
        });
      }

      for (let i = phrase.length - 4; i >= 0; i--) { // Cuting the word from end to the begining - 1 to find more matches, example: HolaMundo (undo, Mundo, aMundo, laMundo, olaMundo).
        const newPhrase = phrase.slice(i, phrase.length); // Cuting the word.
        const arrPD2 = users.filter((u) => u.email.includes(newPhrase));
        arrPD2.forEach((apd) => { // Same process to add a match 
            users = users.filter((u) => u !== apd);
            possibleDuplication.push(apd.email);
        });
      }
    }
  });

  res.status(200).send(possibleDuplication);
});

router.post("/add", async (req, res) => { // Endpoint to add new users in the collection
  const emailVerification = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  if (!emailVerification.test(req.body.email)) {
    res.status(400).send({ message: "Invalid email." });
    return;
  }

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

router.put("/modify/:id", async (req, res) => { // Endpoint to edit an existing user by id. 
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

router.delete("/delete/:id", async (req, res) => {  // Endpoint to delete an existing user by id. 
  const deleteUser = await User.findById(req.params.id);
  if (deleteUser) {
    await deleteUser.remove();
    res.send({ message: "User deleted" });
  } else {
    res.send({ message: "User not found", error: true });
  }
});

export default router;
