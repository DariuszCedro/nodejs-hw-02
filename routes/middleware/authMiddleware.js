import authenticateUser from './authenticate.js';

const authMiddleware = (req, res, next) => {
  authenticateUser(req, res, next);
};

export default authMiddleware;