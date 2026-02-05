import readline from "node:readline/promises";
import 'dotenv/config';
import Groq from "groq-sdk";
import { tavily } from "@tavily/core";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = new tavily({ apiKey: process.env.TAVILY_API_KEY });

async function main() {
    const rl = readline.createInterface({input:process.stdin,output:process.stdout});
    const messages = [
        {
            role: "system",
            // FIX: Removed all manual tool descriptions. 
            // Only provide high-level identity instructions.
            content: `You are a helpful personal assistant. Use the provided tools to answer questions if you don't have the information. Current date: ${new Date().toLocaleString()}`,
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

    while(true){
        const question=await rl.question('You :');
        if(question==='bye'){
            break;
        }
        messages.push({
            role:'user',
            content:question,
        });
    while (true){
    // FIRST CALL: AI decides to use tool
    const completions = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0, // CRITICAL: Keep at 0 for tool use
        messages: messages,
        tools: tools,
        tool_choice: "auto",
    });

    const assistantMessage = completions.choices[0].message;
    //console.log("AssistentMessage : ",assistantMessage);
    messages.push(assistantMessage);

    const toolCalls = assistantMessage.tool_calls;
    if (!toolCalls) {
        console.log(`Assistant: ${assistantMessage.content}`);
        break;
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
            //console.log("after for loop",messages);
        }
    }

    }}rl.close()}

async function webSearch({ query }) {
    //console.log("Searching the web for:", query);
    const response = await tvly.search(query, { maxResults: 4 });
    return response.results.map(r => `${r.title}: ${r.content}`).join('\n');
}

main();