import { prismaClient } from "@repo/db/client";
import express from "express";
import jwt from "jsonwebtoken";
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

  try {
    const user = await prismaClient.user.create({
      data: {
        email: parsedData.data.email,
        password: parsedData.data.password,
        name: parsedData.data.name,
      },
    });

   res.status(201).json({ message: "User created successfully", user });

  } catch (error) {
    console.error("Database error:", error);
     res.status(500).json({ message: "Internal server error" });
     
  }

});

app.post("/signin", (req, res) => {
  const userId = 1;

  const token = jwt.sign({ userId }, JWT_SECRET);
  res.json({
    token,
  });
});

app.post("/room", middleware, (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
