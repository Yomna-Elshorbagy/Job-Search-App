import jwt from "jsonwebtoken";
import { AppError } from "../utils/catchError.js";
import userModel from "../../database/models/user.model.js";

export const verifyToken = (req, res, next) => {

  const { token } = req.headers;
  if (!token) return next(new AppError("please signIn first", 401));
  if (!token.startsWith(process.env.TOKEN_PRIFEX)) return next(new AppError("invalid token prefix", 401));
  
  let [KEY, Token] = token.split(" ");

  jwt.verify(Token, process.env.SECRET_KEY, async (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid Token", err });

    let user = await userModel.findById(decoded.userId);
    if(!user) return next(new AppError('please signUp first', 404));

    req.user = decoded;
    next();
  });
};
