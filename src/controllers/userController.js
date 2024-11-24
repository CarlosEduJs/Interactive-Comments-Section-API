import sharp from 'sharp';
import db from '../services/firebaseService.js'
import multer from 'multer';
import path from 'path';
import fs from "fs"

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/assets/images/uploads/avatars');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage })

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
            return res.status(400).json({ message: 'User already exists' });
        }


        if (!newUser.image || !newUser.image.png || !newUser.image.webp) {
            return res.status(400).json({ message: 'No image provided' });
        }


        const fileName = `image-${newUser.username}`;
        const uploadDir = 'public/assets/images/avatars';

        const pngPath = path.join(uploadDir, `${fileName}.png`);
        const webpPath = path.join(uploadDir, `${fileName}.webp`);


        const pngData = newUser.image.png.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(pngPath, Buffer.from(pngData, 'base64'));


        const webpData = newUser.image.webp.replace(/^data:image\/webp;base64,/, '');
        fs.writeFileSync(webpPath, Buffer.from(webpData, 'base64'));


        const images = {
            png: `./assets/images/avatars/${fileName}.png`,
            webp: `./assets/images/avatars/${fileName}.webp`
        };

        newUser.images = images;


        const docRef = await db.collection('users').add(newUser);
        res.status(201).json({ id: docRef.id, ...newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


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
    getAllUsers, createUser, getUserByUsername, upload
}