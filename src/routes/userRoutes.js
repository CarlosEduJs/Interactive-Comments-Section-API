import express from "express"
const router = express.Router()

import { getAllUsers, getUserByUsername, createUser, upload } from "../controllers/userController.js"

router.get("/users", getAllUsers)
router.get("/users/:username", getUserByUsername)
router.post("/users", upload.single('avatar'), createUser)

export default router 