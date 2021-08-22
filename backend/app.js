import express from "express";
import mongoose from "mongoose";
import { PORT, MONGODB_URL } from "./config.js";

import userRoute from "./routes/userRoute";

mongoose
  .connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .catch((err) => console.log(err.reason));

const app = express();

app.use("/api/user/", userRoute);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
