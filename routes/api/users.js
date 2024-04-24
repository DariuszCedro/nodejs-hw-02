import express from 'express';
import User from '../../models/usersModels.js';
import jwt from 'jsonwebtoken';
import authMiddleware from '../../middlewares/jwt.js';

const router = express.Router()


router.post('/signup', async (req,res)=> {
    const {password, email} = req.body;

    const user = await User.findOne({email}).lean();
    if (user) {
        return res.status(409).json({message: "Email in use"})
    }
    try {
        const newUser = new User({email});
        await newUser.setPassword(password);
        await newUser.save();
        res.status(201).json({message: "User created"});
    }
    catch (e) {
        res.status(500).json(e);
    }
});
//-------------------------------------------
router.post('/login', async (req,res)=> {
    const {password, email} = req.body;

    const user = await User.findOne({email});
    if (!user) {
        return res.status(401).json({message: "No such user"});
    }

        const isPasswordCorrect = await user.validatePassword(password);
        if (isPasswordCorrect) {
            const payload = {
                id: user._id,
                email: user.email,
            };
            const token = jwt.sign(payload, process.env.SECRET, {expiresIn: "12h"});
            return res.json({token})
        } 
        else {
            return res.status(401).json({message: "Email or password is wrong"});
        }
    
    });
//-------------------------------------------
router.get('/logout', authMiddleware, async function logout(req, res) {
    const user = User.findById(_id);
    console.log(user)
    try {
      
      if (!user) {
        return res.status(401).json({ message: 'Not authorized' });
      }
  
      user.token = null;
      await user.save();
  
      return res.status(204).end();
    } catch (err) {
      return res.status(500).json({ message: `An error occurred: ${err.message}` });
    }
  });
// router.get('/current', currentUser); 
// router.patch('/update-subscription', updateSubscription);
//-------------------------------------------
export default router;
