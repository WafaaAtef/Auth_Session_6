## Session 9 — Authentication & Authorization

---
# Agenda
1. [Session Overview](#Session-Overview)
2. [Session Objectives](#Session-Objectives)
4. [Authentication Core Concept](#Authentication)
5. [Authorization Core Concept](#Authorization)
3. [Packages Needed](#Packages-Needed)
5. [Project Structure](#Project-Structure)
6. [Environment Variables](#Environment-Variables-(.env))
7. [Server Setup](#Server-Setup)
8. [Database](#Database)
6. [Auth Controller](#Auth-Controller)
7. [Auth Middleware](#Auth-Middleware)
5. [Auth Routes](#Auth-Routes)
6. [Postman video](#Postman)
9. [References](#References)

---
# Session Overview
In this session, we will cover the essential concepts of Authentication and Authorization. These two topics are fundamental for managing user access and ensuring the security of web applications. We'll explore how to implement both in a web application, using modern techniques such as JWT (JSON Web Tokens) and cookies for secure token management.

---
# Session Objectives

By the end of this session, you should be able to:

* Understand the difference between authentication and authorization.
* Implement authentication using JWT.
* Use Cookies to store authentication tokens
* Build a complete Auth system using Node.js
* Protect routes using middleware to ensure proper authorization.

---

## Core Concepts

### Authentication

Authentication answers the question:

> **Who are you?**

Examples:

* Email & Password login
* JWT Token verification

---

### 🛂 Authorization

Authorization answers the question:

> **What are you allowed to do?**

Examples:

* Accessing a user profile
* Restricting actions to admin users

---

# Packages Needed

```bash
npm init -y
npm install express jsonwebtoken bcryptjs cookie-parser dotenv
npm install -D typescript ts-node @types/node @types/express @types/jsonwebtoken @types/bcryptjs @types/cookie-parser nodemon
npx tsc --init

```

### Package Explanation

To get started with authentication and authorization in a Node.js environment, you will need the following packages:

* express: A minimal and flexible Node.js web application framework.
* jsonwebtoken: A library to sign, verify, and decode JWT tokens.
* bcryptjs: A library for hashing passwords.
* cookie-parser: A middleware to parse cookies.
* **dotenv** → Load environment variables from `.env`

---

## Project Structure

```
auth-project/
│___node_modules/
|
├── src/
│   ├── Data/
│   │   └── data.ts
│   ├── controller/
│   │   └── controller.ts
│   ├── middleware/
│   │   └── middleware.ts
│   ├── routes/
│   │   └── routes.ts
│   └── server.ts
│
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── package-lock.json
```

---

## Environment Variables (.env)

```env
JWT_SECRET=supersecretkey
PORT=3000
```

> Environment variables are used to store sensitive data outside the source code.

---
## Server Setup

### `src/server.ts`

```ts
import dotenv from "dotenv"
import express from "express"
import {router} from "./routes/routes"
import cookieparser from "cookie-parser"
dotenv.config()
const Port = process.env.PORT || 3000

const app =express()


app.use(cookieparser())
app.use(express.json())

app.use("/auth", router)

app.listen(Port ,() => {
console.log (`server is rinnimg on port ${Port}`)
}
)

```

---
## Database

### `src/Data/data.ts`

```ts
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
}

export const users: User[] = [
    {
    id: 1,
    username: "ًwafaa",
    email: "admin@test.com",
    //(if you tried to sign in with this user use 123456 as password > before hashing)
    password: "$2b$10$OPvm12RhYc6mrjnQMQkvOOwrnachLB3ClkHWUrDq8FEaJNRkaiX9u",
    role: "admin",
  },
  {
    id: 2,
    username: "omnia",
    email: "omnia@test.com",
    //password = 666666  before hashing
    password: "$2b$10$9OPfojaUKN5KWkYsNgUuUecKwSCrD3y3OML3TwW9mGMadT3POQkPK",
    role: "user",
  },
];

```

---

##  Auth Controller

In your controller, you will define the logic for registering, logging in, and logging out users.

### `src/controller/controller.ts`



```ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { users , User } from "../data/users.data";

const maxAge = 60 * 60; // 1 hour

const createToken = (id: number ,role :string): string => {
  return jwt.sign({ id , role }, process.env.JWT_SECRET as string, {
    expiresIn: maxAge,
  })
}

```
###  Signup
```ts
const signUp = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body

    const userExists = users.find(u => u.email === email)

    if (userExists) {
      return res.status(400).json({ msg: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser: User = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      role :"user"
    }

    users.push(newUser);

    res.status(201).json({
      status: 201,
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error" })
  }
}

```

### Signin

```ts
const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = users.find(u => u.email === email)
    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password" })
    }

    const token = createToken(user.id , user.role)

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
    })

    res.status(200).json({
      status: 200,
      data: user,
    })
  } catch (error) {
    return res.status(500).json({ msg: "Server error" })
  }
}
```

---

### Signout

```ts
const signOut = (req: Request, res: Response)=> {
  res.clearCookie("token")

  res.status(200).json({
    status: 200,
    msg: "Logged out successfully",
  })
}

//veiwAllusers

 const veiwAllusers = (req :Request ,res :Response) => {
 res.status(200).json({data :users})
 }

 export {signOut, signUp,signIn ,veiwAllusers}

```

---

##  Auth Middleware

### `src/middleware/middleware.ts`

### Authentication Middleware

```ts
import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

const authorization = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const token = req.cookies?.token;

  if (!token) {
   return res.status(401).json({ msg: "Unauthorized" })
  }

  try {
   const decoded = jwt.verify(token ,process.env.JWT_SECRET as string) as { id: number , role :string}

if(decoded.role !== "admin"){
    return res.status(401).json({msg:"unauthorized"})
}

  next()

  } catch (error) {
    return res.status(401).json({ msg: "Invalid token" })
  }
}

export { authorization }

```
---

##  Routes

### `src/routes/routes.ts`

```ts
import {signOut, signUp , signIn , veiwAllusers} from "../controller/authController"
import {authorization} from "../middleware/middleware"
import {Router} from "express"

const router =Router()

router.post("/signUp",signUp)
router.post("/signIn",signIn)
router.get("/signOut",signOut)

router.get("/Users" ,authorization ,veiwAllusers)

export {router}
```
---
## Postman video(testing endPoints)
https://drive.google.com/file/d/1BID2xLCKj1ilIYcP4CYtPFGRuTX2mCTg/view?usp=sharing
---

## References
---
* https://youtu.be/1O3L1hzfRQc?si=tLg2dY6pEIMkKLY7
* https://youtu.be/aanOygFD4Fo?si=YRv7k9r5YtnlUZ6L
* jwt.io
* https://emn178.github.io/online-tools/sha256.html

---
✨ End of Session
