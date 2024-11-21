import db from '../services/firebaseService.js'

const getAllUsers = async (req, res) => {
    try {
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const createUser = async (req, res) => {
    try {
        const newUser = req.body;
        const snapshot = await db.collection('users').where('username', '==', newUser.username).get();

        if (!snapshot.empty) {
            return res.status(400).json({ message: 'User already exists' })
        }

        const images = {
            png: `/assets/images/avatars/image-${newUser.username}.png`,
            webp: `/assets/images/avatars/image-${newUser.username}.webp`
        }

        newUser.images = images

        const docRef = await db.collection('users').add(newUser)
        res.status(201).json({ id: docRef.id, ...newUser })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const getUserByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const snapshot = await db
            .collection('users')
            .where('username', '==', username)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = snapshot.docs[0].data();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
    getAllUsers, createUser, getUserByUsername
}