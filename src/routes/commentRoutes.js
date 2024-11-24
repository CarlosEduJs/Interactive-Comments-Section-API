import express from "express"
const router = express.Router()

import { getAllComments, addComment, deleteComment, updateComment, addReply, updateReply, deleteReply, getRepliesByComment } from "../controllers/commentsController.js"

router.get('/comments', getAllComments)
router.post('/comments', addComment)
router.put('/comments/:id', updateComment)
router.delete('/comments/:id', deleteComment)

router.post("/comments/:id", addReply);
router.put("/comments/:id/replies/:replyId", updateReply);
router.get('/comments/:id/replies', getRepliesByComment);
router.delete('/comments/:id/replies/:replyId', deleteReply);

export default router;