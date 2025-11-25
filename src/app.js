import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import voteRoutes from "./routes/votesRoutes.js";
import commentsRoutes from "./routes/commentsRoutes.js";
import userRoutes from "./routes/userRoutes.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory (server root)
dotenv.config({ path: path.join(__dirname, '../.env') });
const app=express();

app.use(
    cors(*)
);

//middleware 
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

//Routes
app.use("/auth",authRoutes);
app.use("/api",reportRoutes);
app.use("/api",voteRoutes);
app.use("/api",commentsRoutes);
app.use("/api/user", userRoutes);

app.get("/ping",(req,res)=>{
    res.send("message: \"pong\" ");
});

// Add this before export default app;
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

export default app;