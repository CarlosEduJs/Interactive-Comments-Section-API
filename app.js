import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url";

import dotenv from "dotenv"

dotenv.config()

import commentsRoutes from "./src/routes/commentRoutes.js"
import userRoutes from "./src/routes/userRoutes.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const corsOptions = {
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())

app.use('/api', commentsRoutes, userRoutes);

const PORT = process.env.PORT_SECRET || 5000

app.listen(PORT, () => console.log("Server running", PORT))