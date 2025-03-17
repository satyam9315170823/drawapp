import { prismaClient } from "@repo/db/client";
import  { Request, Response } from "express";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "@repo/backend-common/config";

import { middleware } from "./middleware";
import {
  CreateUserSchema,
  SigninSchema,
  CreateRoomSchema,
} from "@repo/common/types";

const app = express();
app.use(express.json());
const port = 5000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/signup", async(req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log(parsedData.error);
    res.json({
      message: "Incorrect inputs",
    });
    return;
  }
  const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);
  try {
    const user = await prismaClient.user.create({
      data: {
        email: parsedData.data.email,
        password:hashedPassword,
        name: parsedData.data.name,
      },
    });

   res.status(201).json({ 
    userId:user.id
    });

  } catch (error) {
    console.error("Database error:", error);
     res.status(500).json({ message: "user already exist" });
     
  }

});




app.post("/signin", async (req: Request, res: Response) => {
  try {
    // Validate request body using Zod schema
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
      res.status(400).json({ message: "Incorrect inputs" });
      return; // Stops execution
    }

    // Find user by email
    const user = await prismaClient.user.findUnique({
      where: { email: parsedData.data.email },
    });

    if (!user) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(parsedData.data.password, user.password);
    if (!isMatch) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id },JWT_SECRET);

    res.json({ token }); // Sends response without return
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.post("/room", middleware, async (req, res) => {
 
  const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    // @ts-ignore: TODO: Fix this
    const userId = req.userId;

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId
            }
        })

        res.json({
            roomId: room.id
        })
    } catch(e) {
        res.status(411).json({
            message: "Room already exists with this name"
        })
    }
  });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
