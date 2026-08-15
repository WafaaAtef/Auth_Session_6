import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import User from "../models/usersModel"
import { Request, Response } from "express";

const maxAge = 60 * 60;
 const createToken = (id: string) => {
  return jwt.sign({ id}, process.env.JWT_SECRET as string, {
    expiresIn: maxAge,
  });
};


const signUp = async (req: Request, res: Response) => {
  try {
    const { userName, email, password } = req.body;


    if (!userName || !email || !password) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      userName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      status: 201,
      msg: 'created',
    });

  } catch (error) {
    res.status(500).json({ msg: 'Server error'});
  }
};

const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        msg: "All fields are required"
      });
    }
    const user = await User.findOne({ email });
    if (!user ) {
      return res.status(400).json({ msg: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid email or password' });
    }

    const token = createToken(user.id);

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
    });

    res.status(200).json({
      status: 200,
      data: user.userName,
    });

  } catch (error) {
    res.status(500).json({ msg: 'Server error'});
  }
};


const signOut = (req: Request, res: Response) => {
  res.clearCookie("token")

  res.status(200).json({
    status: 200,
    msg: "Logged out successfully",
  })
}
const profile = (req: Request, res: Response) => {
  res.status(200).json({ msg: "you are authenticated" });
}

const DeleteUser = async (req: Request, res: Response) => {
  res.status(200).json({ msg: "User deleted successfully" });
}

const ShowAllUsers = async (req: Request, res: Response) => {
  res.status(200).json({ msg: "All users retrieved successfully" });
}

export { signUp, signIn, signOut, profile, DeleteUser, ShowAllUsers };