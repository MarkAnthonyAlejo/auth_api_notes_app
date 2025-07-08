import express from "express";
import cors from 'cors';
import dotenv from 'dotenv'; 
import userRoutes from './routes/userRoutes'
import notesRoutes from './routes/notesRoutes'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.use(cors({
  origin: ['http://localhost:8000', 'https://your-frontend.vercel.app'],
  credentials: true,
}));

app.use('/users',userRoutes);
app.use('/notes', notesRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
