import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: {
      type: String,
      default: null,
    },
  });

//------register-------------
  userSchema.methods.setPassword = async function (password) {
    this.password = await bcrypt.hash(password, 6);
  };
//------login----------------
  userSchema.methods.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password)
  };

const User = mongoose.model("User", userSchema);

export default User;