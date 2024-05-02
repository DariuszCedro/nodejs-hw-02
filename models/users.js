import Joi from 'joi';
import User from "../models/usersModels.js";
import bcrypt from 'bcrypt';
import path from 'path';
import { nanoid } from 'nanoid';
import jimp from "jimp";
import nodemailer from "nodemailer";
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
      const verificationToken = nanoid();
  
      const newUser = new User({
        email: req.body.email,
        password: hashedPassword,
        subscription: "starter",
        verificationToken, 
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

    if (!user.verify) {
      return res.status(401).json({ message: 'Email address not verified' });
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
//------------update avatar---------------------------------------------------
export async function updateAvatar(req, res) {
  try {
    const { user } = req;

    if (!req.file) {
      return res.status(400).json({ message: 'No avatar uploaded' });
    }

    const avatarPath = req.file.path;
    const uniqueFileName = req.file.filename;
    
    const image = await jimp.read(avatarPath);
    await image.resize(250, 250).write(path.join('tmp', uniqueFileName));

    const newPath = path.join('public', 'avatars', uniqueFileName);
    await image.write(newPath);

    user.avatarURL = `/avatars/${uniqueFileName}`;
    await user.save();

    return res.status(200).json({ avatarURL: user.avatarURL });
  } catch (err) {
    return res.status(500).json({ message: `An error occurred: ${err.message}` });
  }
}
//------------verify user---------------------------------------------------
export async function verifyUser(req, res) {
  try {
    console.log(req.params)
    const { verificationToken } = req.params;

    const user = await User.findOne({ verificationToken });
    console.log(user)

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.verify = true;
    // user.verificationToken = null;
    await user.save();

    return res.status(200).json({ message: 'Verification successful' });
  } catch (err) {
    return res.status(500).json({ message: `An error occurred: ${err.message}` });
  }
}
//------------verification email---------------------------------------------------
export async function resendVerificationEmail(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'missing required field email' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verify) {
      return res.status(400).json({ message: 'Verification has already been passed' });
    }

    const verificationLink = `${process.env.BASE_URL}/api/users/verify/${user.verificationToken}`;

    const config = {
      host: 'smtp.mailgun.org',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILGUN_USER,
        pass: process.env.MAILGUN_PASSWD,
      },
      tls: {
        ciphers:'SSLv3'
    }
    };
    
    const transporter = nodemailer.createTransport(config);
    const emailOptions = {
      from: 'postmaster@sandbox04e9e651b34b42ccae9c844033f76a34.mailgun.org',
      to: user.email,
      subject: 'Email Verification',
      text: `Click on the following link to verify your email: ${verificationLink}`,
    };
    
    transporter
      .sendMail(emailOptions)
      .then(info => console.log(info))
      .catch(err => console.log(err));
   
    return res.status(200).json({ message: 'Verification email sent' });
  } catch (err) {
    return res.status(500).json({ message: `An error occurred: ${err.message}` });
  }
}