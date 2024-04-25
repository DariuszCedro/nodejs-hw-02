
import jwt from 'jsonwebtoken';
import User from '../../models/usersModels.js';

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.SECRET);
    const user = await User.findOne({ _id: decoded._id, token });
   
    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

export default authenticateUser;
