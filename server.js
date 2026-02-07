import express from 'express';
import { generate } from './chatbot.js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, I am chatBot server!');
});

app.post('/chat', async (req, res) => {
    const { message, threadId } = req.body;
    if (!message || !threadId) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const result = await generate(message, threadId);
    res.json({ reply: result });
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
