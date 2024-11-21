import db from "../services/firebaseService.js"

const getAllComments = async (req, res) => {
    try {
        const snapshot = await db.collection('comments').get();
        const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        res.status(200).json(comments)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const addComment = async (req, res) => {
    try {
        const { user, ...commentData } = req.body;
        const userSnapshot = await db.collection('users').where('username', '==', user.username).get()
        if (userSnapshot.empty) {
            return res.status(400).json({ message: "User does not exist" })
        }

        const docRef = await db.collection('comments').add({
            ...commentData,
            user: user.username,
            createdAt: new Date().toISOString()
        })

        res.status(201).json({ id: docRef.id, ...commentData, user: user.username });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        await db.collection('comments').doc(id).update(updatedData);
        res.status(200).json({ id, ...updatedData });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('comments').doc(id).delete()
        res.status(200).json({ message: "Comment Deleted!" })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export {
    getAllComments,
    addComment,
    updateComment,
    deleteComment
}