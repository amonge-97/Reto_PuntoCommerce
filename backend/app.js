import express from "express";
import mongoose from "mongoose";
import { PORT, MONGODB_URL } from "./config.js";

import userRoute from "./routes/userRoute.js";

mongoose
  .connect(MONGODB_URL, { //Conecting to mongodb 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .catch((err) => console.log(err.reason));

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Allows body with json format. this replace body-parse

app.use("/api/user/", userRoute); //use all enpoint from userRoute and should start with /api/user/.

app.get("/", (req, res) => { // Welcome message
  res.send("Hello World!");
});

app.listen(PORT, () => { // Init server on a especific port.
  console.log(`Server listening at http://localhost:${PORT}`);
});
