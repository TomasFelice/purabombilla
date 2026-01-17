import { Groq } from 'groq-sdk';
import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { GoogleGenAI } from '@google/genai';

interface AIProvider {
    name: string;
    generateText(prompt: string, model?: string): Promise<string>;
}

class GroqProvider implements AIProvider {
    name = 'Groq';
    private client: Groq;

    constructor(apiKey: string) {
        this.client = new Groq({ apiKey });
    }

    async generateText(prompt: string): Promise<string> {
        const completion = await this.client.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'mixtral-8x7b-32768', // Excellent free model on Groq
            temperature: 0.7,
        });
        return completion.choices[0]?.message?.content || '';
    }
}

class CerebrasProvider implements AIProvider {
    name = 'Cerebras';
    private client: Cerebras;

    constructor(apiKey: string) {
        this.client = new Cerebras({ apiKey });
    }

    async generateText(prompt: string): Promise<string> {
        const uniquePrompt = `${prompt} [${Date.now()}]`; // Prevent caching issues
        try {
            const completion = await this.client.chat.completions.create({
                messages: [{ role: 'user', content: uniquePrompt }],
                model: 'llama3.1-8b', // Standard model
                stream: false,
                temperature: 0.7,
            });
            // Type assertion or optional chaining to handle potential API differences, 
            // though the SDK should match standard OpenAI shape roughly.
            // @ts-ignore - The SDK types might be slighty different, but structure is usually compatiable.
            return completion.choices[0]?.message?.content || '';
        } catch (e) {
            console.error("Cerebras Error details:", e);
            throw e;
        }
    }
}

class GeminiProvider implements AIProvider {
    name = 'Gemini';
    private client: GoogleGenAI;
    private apiKey: string;

    constructor(apiKey: string) {
        this.client = new GoogleGenAI({ apiKey });
        this.apiKey = apiKey;
    }

    async generateText(prompt: string): Promise<string> {
        // Updated to use the new @google/genai SDK pattern provided by user
        // Using gemini-2.0-flash-exp or gemini-1.5-flash which are good free options
        const modelId = 'gemini-1.5-flash';

        try {
            const response = await this.client.models.generateContent({
                model: modelId,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    temperature: 0.7,
                }
            });

            if (response.candidates && response.candidates.length > 0) {
                const text = response.candidates[0]?.content?.parts?.[0]?.text;
                if (text) return text;
            }
            // Fallback if needed or different structure
            return '';


        } catch (e: any) {
            console.error("Gemini Error:", e);
            throw e;
        }
    }

}

export class MultiProviderGenerator {
    private providers: AIProvider[] = [];

    constructor() {
        if (process.env.GROQ_API_KEY) {
            this.providers.push(new GroqProvider(process.env.GROQ_API_KEY));
        }
        if (process.env.CEREBRAS_API_KEY) {
            this.providers.push(new CerebrasProvider(process.env.CEREBRAS_API_KEY));
        }
        if (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY) {
            const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';
            this.providers.push(new GeminiProvider(key));
        }
    }

    async generateText(prompt: string): Promise<string> {
        if (this.providers.length === 0) {
            throw new Error("No AI providers configured. Please check your API keys.");
        }

        // Shuffle providers for load balancing
        const shuffled = [...this.providers].sort(() => Math.random() - 0.5);

        for (const provider of shuffled) {
            try {
                console.log(`[AI Service] Attempting to use provider: ${provider.name}`);
                const result = await provider.generateText(prompt);
                if (result) {
                    console.log(`[AI Service] Success with ${provider.name}`);
                    return result;
                }
            } catch (error) {
                console.warn(`[AI Service] Provider ${provider.name} failed:`, error);
                // Continue to next provider
            }
        }

        throw new Error("All AI providers failed to generate text.");
    }

}

