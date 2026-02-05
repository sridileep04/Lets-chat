import express from 'express';
import { generate } from './chatbot.js';
import cors from 'cors';

const app=express();
const PORT=process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send('Hello, World!');
});

app.post('/chat', async(req,res)=>{
    const {message}=req.body;
    const result = await generate(message);
    res.json({reply:result});
});
app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});
