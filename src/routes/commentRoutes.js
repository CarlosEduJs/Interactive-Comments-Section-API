import express from "express"
const router = express.Router()

import { getAllComments, addComment, deleteComment, updateComment } from "../controllers/commentsController.js"

router.get('/comments', getAllComments)
router.post('/comments', addComment)
router.put('/comments/:id', updateComment)
router.delete('/comments/:id', deleteComment)

export default router;