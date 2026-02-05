import readline from "node:readline/promises";
import 'dotenv/config';
import Groq from "groq-sdk";
import { tavily } from "@tavily/core";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = new tavily({ apiKey: process.env.TAVILY_API_KEY });

export async function generate(userMessage) {
    const messages = [
        {
            role: "system",
            content: `You are a personal assistant.
            If you know the answer to a question, answer to it directly in plain English. 
            If the answer requires real-time, local or up-to-date information, or you don't know the answer use the available tools to find it.
            You have the access to following tool:
            webSearch(query: string) : Use this tool to search the linternet for current information or unknown information.
            Deside when to use your own knowledge and when to use the tool.
            Do not mention the unless needed.
            Examples:
            Q: What is the capital of France?
            A: The capital of France is Paris.
            Q: What is the current weather in New York?
            A: [use webSearch to find the current weather in New York]
            Q: Tell me latest news about AI.
            A: [use webSearch to find the latest news about AI]
            
            . Current date: ${new Date().toLocaleString()}`,
        },
        // {
        //     role: "user",
        //     content: "What is the current weather in kochi ?",
        // },
    ];

    const tools = [
        {
            type: "function",
            function: {
                name: "webSearch",
                description: "Search the latest information and realtime data on internet.",
                parameters: {
                    type: 'object',
                    properties: {
                        query: { type: 'string', description: 'The search query.' },
                    },
                    required: ['query'],
                }
            },
        }
    ];

    messages.push({
        role: 'user',
        content: userMessage,
    });
    while (true) {
        // FIRST CALL: AI decides to use tool
        const completions = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            temperature: 0,
            messages: messages,
            tools: tools,
            tool_choice: "auto",
        });

        const assistantMessage = completions.choices[0].message;
        messages.push(assistantMessage);

        const toolCalls = assistantMessage.tool_calls;
        if (!toolCalls) {
            return assistantMessage.content;
        }

        // PROCESS THE TOOL CALLS
        for (const tool of toolCalls) {
            if (tool.function.name === 'webSearch') {
                const { query } = JSON.parse(tool.function.arguments);
                const toolResult = await webSearch({ query });

                messages.push({
                    tool_call_id: tool.id,
                    role: 'tool',
                    name: 'webSearch',
                    content: toolResult,
                });
            }
        }

    }
}

async function webSearch({ query }) {
    const response = await tvly.search(query, { maxResults: 3 });
    return response.results.map(r => `${r.title}: ${r.content}`).join('\n');
}