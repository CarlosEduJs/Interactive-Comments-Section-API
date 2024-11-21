import express from "express"
const router = express.Router()

import { getAllUsers, getUserByUsername, createUser } from "../controllers/userController.js"

router.get("/users", getAllUsers)
router.get("/users/:username", getUserByUsername)
router.post("/users", createUser)

export default router