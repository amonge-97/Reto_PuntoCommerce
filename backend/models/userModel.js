import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: { type: String, require: true },
  username: { type: String, require: true, unique: true },
  email: { type: String, require: true, unique: true, index: true },
  status: { type: String, required: true, default: "active" },
});

const userModel = model("User", userSchema);

export default userModel;
