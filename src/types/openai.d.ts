/**
 * OpenAI 服务相关的类型定义
 */

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
}

export interface ChatResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export interface ModelInfo {
    id: string;
    object: string;
    created: number;
    owned_by: string;
}

export interface OpenAIServiceInterface {
    setApiKey(apiKey: string): void;
    sendMessage(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse>;
    sendMessageStream(
        messages: ChatMessage[], 
        onChunk: (content: string) => void, 
        options?: ChatOptions
    ): Promise<void>;
    validateApiKey(apiKey: string): Promise<boolean>;
    getModels(): Promise<ModelInfo[]>;
    getCurrentModel(): string;
    setDefaultModel(model: string): void;
    isInitialized(): boolean;
}

export type ChunkCallback = (content: string) => void;