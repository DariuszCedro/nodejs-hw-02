import Joi from 'joi';
import User from "../models/usersModels.js";
import bcrypt from 'bcrypt';

//------------signup---------------------------------------------------
const signupSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(4).required(),
  });
  
  export async function signup(req, res) {
    try {
      const { error } = signupSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
  
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(409).json({ message: 'Email in use' });
      }
  
      const hashedPassword = await bcrypt.hash(req.body.password, 8);
      console.log(hashedPassword)
  
      const newUser = new User({
        email: req.body.email,
        password: hashedPassword,
        subscription: "starter", 
      });
  
      await newUser.save();
  
      return res.status(201).json({
        user: {
          email: newUser.email,
          subscription: newUser.subscription,
        },
      });
    } catch (err) {
      return res.status(500).json({ message: `An error occurred: ${err.message}` });
    }
  }
//------------login---------------------------------------------------
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(4).required(),
});

export async function login(req, res) {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ message: 'Email or password is wrong' });
    }
    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Email or password is wrong' });
    }

    const token = await user.generateAuthToken();

    return res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: `An error occurred: ${err.message}` });
  }
}
//------------logout---------------------------------------------------
export async function logout(req, res) {
  try {
    const { user } = req;
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    user.token = null;
    await user.save();

    return res.status(204).end();
  } catch (err) {
    return res.status(500).json({ message: `An error occurred: ${err.message}` });
  }
}
//------------current user---------------------------------------------------
export const currentUser = async (req, res) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    return res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (err) {
    return res.status(500).json({ message: `An error occurred: ${err.message}` });
  }
};