import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import gravatar from 'gravatar'; 
import { nanoid } from "nanoid";

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
    avatarURL: {
      type: String,
      default: null,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, 'Verify token is required'],
    },
  });

  userSchema.pre('save', async function (next) {
    const user = this;
   
    if (!user.avatarURL) {
      const avatarURL = gravatar.url(user.email, { s: '200', r: 'pg', d: 'mm' });
      user.avatarURL = avatarURL;
    }

    if (!user.verificationToken) {

      user.verificationToken = nanoid();
     
    }
  
    next();
  });
  
  
  userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET);
    user.token = token;
    await user.save();
    return token;
  };



const User = mongoose.model("User", userSchema);

export default User;