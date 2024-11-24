import db from "../services/firebaseService.js"

function gerarIdUnico(tamanho = 10) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < tamanho; i++) {
        id += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return id;
}

const fetchUserDetails = async (username) => {
    const userSnapshot = await db
        .collection("users")
        .where("username", "==", username)
        .get();

    if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        return { username: userData.username, image: userData.image };
    }

    return { username, image: null }; 
};

const processReplies = async (replies) => {
    if (!replies || replies.length === 0) return [];

    return Promise.all(
        replies.map(async (reply) => {
            const userDetails = await fetchUserDetails(reply.user.username || reply.user);
            const processedNestedReplies = await processReplies(reply.nestedReplies || []);
            return {
                ...reply,
                id: reply.id || gerarIdUnico(12),
                replyId: reply.id || gerarIdUnico(12),
                user: userDetails,
                nestedReplies: processedNestedReplies
            };
        })
    );
};

const getAllComments = async (req, res) => {
    try {
        const snapshot = await db.collection("comments").get();
        const comments = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const comment = { id: doc.id, ...doc.data() };
                comment.user = await fetchUserDetails(comment.user.username || comment.user);
                comment.replies = await processReplies(comment.replies);

                return comment;
            })
        );

        res.status(200).json(comments);
    } catch (error) {
        console.error("Erro ao buscar comentários:", error);
        res.status(500).json({ error: error.message });
    }
};

const addComment = async (req, res) => {
    try {
        const { user, replies = [], ...commentData } = req.body;
        const userSnapshot = await db.collection('users').where('username', '==', user.username).get()
        if (userSnapshot.empty) {
            return res.status(400).json({ message: "User does not exist" })
        }

        const processedReplies = await Promise.all(
            replies.map(async (reply) => {
                const userDetails = await fetchUserDetails(reply.user.username);
                return {
                    ...reply,
                    id: gerarIdUnico(12),
                    createdAt: new Date().toISOString(),
                    user: userDetails
                };
            })
        );

        const docRef = await db.collection('comments').add({
            ...commentData,
            user: user.username,
            replies: processedReplies,
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
        updatedData.createdAt = new Date().toISOString()
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

const addReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { user, content, parentReplyId = null } = req.body;

        const commentRef = db.collection('comments').doc(id);
        const commentSnapshot = await commentRef.get();

        if (!commentSnapshot.exists) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const userDetails = await fetchUserDetails(user.username);

        const newReply = {
            id: gerarIdUnico(12),
            score: 0,
            user: userDetails,
            content,
            createdAt: new Date().toISOString(),
            nestedReplies: []
        }

        const commentData = commentSnapshot.data();


        const addNestedReply = (replies, parentId) => {
            return replies.map(reply => {
                if (reply.id === parentId) {

                    return {
                        ...reply,
                        nestedReplies: [...reply.nestedReplies, newReply],
                    };
                }
                if (reply.nestedReplies) {

                    return {
                        ...reply,
                        nestedReplies: addNestedReply(reply.nestedReplies, parentId),
                    };
                }
                return reply;
            });
        };

        let updatedReplies;
        if (parentReplyId) {
            updatedReplies = addNestedReply(commentData.replies || [], parentReplyId);
        } else {

            updatedReplies = [...(commentData.replies || []), newReply];
        }
        
        await commentRef.update({ replies: updatedReplies });

        res.status(201).json({ message: "Reply added successfully", reply: newReply });
    } catch (error) {
        console.error("Erro ao adicionar reply:", error);
        res.status(500).json({ error: error.message });
    }
};

const getRepliesByComment = async (req, res) => {
    try {
        const { id } = req.params;
        const commentRef = db.collection('comments').doc(id);
        const commentSnapshot = await commentRef.get();

        if (!commentSnapshot.exists) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const { replies = [] } = commentSnapshot.data();
        res.status(200).json(replies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const updateReply = async (req, res) => {
    try {
        const { id, replyId } = req.params;
        const updatedReplyData = req.body;

        const commentRef = db.collection('comments').doc(id);
        const commentSnapshot = await commentRef.get();

        if (!commentSnapshot.exists) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const commentData = commentSnapshot.data();
        const updateNestedReplies = (replies) => {
            return replies.map(reply => {
                if (reply.id === replyId) {
                    return { ...reply, ...updatedReplyData, updatedAt: new Date().toISOString() };
                }
                if (reply.nestedReplies) {
                    return {
                        ...reply,
                        nestedReplies: updateNestedReplies(reply.nestedReplies),
                    };
                }
                return reply;
            });
        };

        const updatedReplies = updateNestedReplies(commentData.replies || [])

        await commentRef.update({ replies: updatedReplies });
        res.status(200).json({ message: "Reply updated successfully", replyId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteReply = async (req, res) => {
    try {
        const { id, replyId } = req.params;

        const commentRef = db.collection('comments').doc(id);
        const commentSnapshot = await commentRef.get();

        if (!commentSnapshot.exists) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const commentData = commentSnapshot.data();

        const deleteNestedReplies = (replies) => {
            return replies
                .filter(reply => reply.id !== replyId)
                .map(reply => ({
                    ...reply,
                    nestedReplies: deleteNestedReplies(reply.nestedReplies || []),
                }));
        };

        const updatedReplies = deleteNestedReplies(commentData.replies || []);

        await commentRef.update({ replies: updatedReplies });
        res.status(200).json({ message: "Reply deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
    getAllComments,
    addComment,
    updateComment,
    deleteComment,
    addReply,
    getRepliesByComment,
    updateReply,
    deleteReply
}