import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
      // Check for token in cookies first
      let token = req.cookies.token;
      
      // If not in cookies, check Authorization header
      if (!token && req.headers.authorization) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        return res.status(401).json({
          message: "User not authenticated",
          success: false,
        });
      }

      const decode = await jwt.verify(token, process.env.SECRET_KEY);
      if (!decode) {
        return res.status(401).json({
          message: "Invalid token",
          success: false,
        });
      }
      req.id = decode.userId;
      next();
    } catch (error) {
      console.log(error);
      return res.status(401).json({
        message: "Authentication failed",
        success: false,
      });
    }
  };

export default isAuthenticated;