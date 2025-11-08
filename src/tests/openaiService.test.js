/**
 * OpenAI Service 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the openai library completely
const mockCreate = vi.fn();
const mockList = vi.fn();

class MockOpenAI {
    constructor(config) {
        this.apiKey = config?.apiKey;
        this.chat = {
            completions: {
                create: mockCreate
            }
        };
        this.models = {
            list: mockList
        };
    }
}

// Mock error classes
class APIError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'APIError';
        this.status = status;
    }
}

class APIConnectionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'APIConnectionError';
    }
}

class RateLimitError extends APIError {
    constructor(message) {
        super(message, 429);
        this.name = 'RateLimitError';
    }
}

class APITimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = 'APITimeoutError';
    }
}

// 将错误类附加到MockOpenAI上，模拟真实的OpenAI库结构
MockOpenAI.APIError = APIError;
MockOpenAI.APIConnectionError = APIConnectionError;
MockOpenAI.RateLimitError = RateLimitError;
MockOpenAI.APITimeoutError = APITimeoutError;

vi.mock('openai', () => ({
    default: MockOpenAI,
    OpenAI: MockOpenAI,
    APIError,
    APIConnectionError,
    RateLimitError,
    APITimeoutError
}));

// 动态导入服务以确保mock生效
const { openaiService } = await import('../services/openaiService.js');

describe('OpenAIService', () => {
    beforeEach(() => {
        // Reset service state
        openaiService.client = null;
        openaiService.apiKey = null;
        vi.clearAllMocks();
    });

    describe('setApiKey', () => {
        it('should set API key and initialize client', () => {
            const apiKey = 'test-api-key';
            openaiService.setApiKey(apiKey);
            
            expect(openaiService.apiKey).toBe(apiKey);
            expect(openaiService.client).toBeDefined();
        });

        it('should throw error for empty API key', () => {
            expect(() => openaiService.setApiKey('')).toThrow('API密钥不能为空');
            expect(() => openaiService.setApiKey(null)).toThrow('API密钥不能为空');
        });
    });

    describe('sendMessage', () => {
        beforeEach(() => {
            openaiService.setApiKey('test-api-key');
        });

        it('should send message successfully', async () => {
            const mockResponse = {
                id: 'test-id',
                choices: [{
                    message: {
                        role: 'assistant',
                        content: 'Hello, world!'
                    }
                }]
            };

            mockCreate.mockResolvedValue(mockResponse);

            const messages = [{ role: 'user', content: 'Hello' }];
            const result = await openaiService.sendMessage(messages);

            expect(mockCreate).toHaveBeenCalledWith({
                model: 'gpt-3.5-turbo',
                messages: messages,
                temperature: 0.7,
                max_tokens: 2000,
                stream: false
            });
            expect(result).toEqual(mockResponse);
        });

        it('should throw error when client not initialized', async () => {
            openaiService.client = null;
            
            await expect(openaiService.sendMessage([])).rejects.toThrow('API密钥未设置');
        });

        it('should use custom options', async () => {
            const mockResponse = { id: 'test-id', choices: [] };
            mockCreate.mockResolvedValue(mockResponse);

            const messages = [{ role: 'user', content: 'Hello' }];
            const options = {
                model: 'gpt-4',
                temperature: 0.5,
                maxTokens: 1000
            };

            await openaiService.sendMessage(messages, options);

            expect(mockCreate).toHaveBeenCalledWith({
                model: 'gpt-4',
                messages: messages,
                temperature: 0.5,
                max_tokens: 1000,
                stream: false
            });
        });
    });

    describe('validateApiKey', () => {
        it('should return true for valid API key', async () => {
            const mockResponse = { choices: [{ message: { content: 'Hello' } }] };
            
            mockCreate.mockResolvedValue(mockResponse);

            const result = await openaiService.validateApiKey('valid-key');
            expect(result).toBe(true);
        });

        it('should return false for invalid API key', async () => {
            mockCreate.mockRejectedValue(new APIError('Invalid API key', 401));

            const result = await openaiService.validateApiKey('invalid-key');
            expect(result).toBe(false);
        });
    });

    describe('getModels', () => {
        beforeEach(() => {
            openaiService.setApiKey('test-api-key');
        });

        it('should return filtered and sorted models', async () => {
            const mockModels = {
                data: [
                    { id: 'gpt-4', object: 'model' },
                    { id: 'text-davinci-003', object: 'model' },
                    { id: 'gpt-3.5-turbo', object: 'model' },
                    { id: 'whisper-1', object: 'model' }
                ]
            };

            mockList.mockResolvedValue(mockModels);

            const result = await openaiService.getModels();

            expect(mockList).toHaveBeenCalled();
            expect(result).toEqual([
                { id: 'gpt-3.5-turbo', object: 'model' },
                { id: 'gpt-4', object: 'model' }
            ]);
        });
    });

    describe('error handling', () => {
        beforeEach(() => {
            openaiService.setApiKey('test-api-key');
        });

        it('should handle API errors correctly', async () => {
            const apiError = new APIError('Unauthorized', 401);
            mockCreate.mockRejectedValue(apiError);

            await expect(openaiService.sendMessage([])).rejects.toThrow('API密钥无效或已过期');
        });

        it('should handle rate limit errors', async () => {
            const rateLimitError = new RateLimitError('Rate limit exceeded');
            mockCreate.mockRejectedValue(rateLimitError);

            await expect(openaiService.sendMessage([])).rejects.toThrow('请求过于频繁，请稍后再试');
        });
    });

    describe('utility methods', () => {
        it('should get and set default model', () => {
            expect(openaiService.getCurrentModel()).toBe('gpt-3.5-turbo');
            
            openaiService.setDefaultModel('gpt-4');
            expect(openaiService.getCurrentModel()).toBe('gpt-4');
        });

        it('should check initialization status', () => {
            expect(openaiService.isInitialized()).toBe(false);
            
            openaiService.setApiKey('test-key');
            expect(openaiService.isInitialized()).toBe(true);
        });
    });
});