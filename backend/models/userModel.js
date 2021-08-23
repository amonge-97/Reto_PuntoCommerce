import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Schema to define the content of the users collection. 

const userSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, index: true },
  status: { type: String, required: true, default: "active" },
});

const userModel = model("User", userSchema);

export default userModel;
