import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 5000;

export const MONGODB_URL =
  process.env.MONGODB_URL ||
  "mongodb+srv://puntocommerce:KyLPfMGB5XeGlDu8@cluster0.lzd6u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
