/**
 * OpenAI API 服务
 * 使用官方 OpenAI JavaScript 库处理与OpenAI API的所有交互
 */

import OpenAI from 'openai';

class OpenAIService {
    constructor() {
        this.client = null;
        this.defaultModel = "gpt-3.5-turbo";
    }

    /**
     * 设置API密钥并初始化客户端
     */
    setApiKey(apiKey) {
        if (!apiKey) {
            throw new Error("API密钥不能为空");
        }
        
        this.apiKey = apiKey;
        this.client = new OpenAI({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true // 允许在浏览器中使用
        });
    }

    /**
     * 检查客户端是否已初始化
     */
    _ensureClient() {
        if (!this.client) {
            throw new Error("API密钥未设置，请先调用 setApiKey() 方法");
        }
    }

    /**
     * 发送聊天消息
     */
    async sendMessage(messages, options = {}) {
        this._ensureClient();
        
        try {
            const response = await this.client.chat.completions.create({
                model: options.model || this.defaultModel,
                messages: messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 2000,
                stream: options.stream || false,
            });

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * 流式发送消息
     */
    async sendMessageStream(messages, onChunk, options = {}) {
        this._ensureClient();
        
        try {
            const stream = await this.client.chat.completions.create({
                model: options.model || this.defaultModel,
                messages: messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 2000,
                stream: true,
            });

            for await (const chunk of stream) {
                const content = chunk.choices?.[0]?.delta?.content;
                if (content) {
                    onChunk(content);
                }
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * 验证API密钥
     */
    async validateApiKey(apiKey) {
        try {
            // 创建临时客户端进行验证
            const tempClient = new OpenAI({
                apiKey: apiKey,
                dangerouslyAllowBrowser: true
            });

            // 发送一个简单的请求来验证密钥
            await tempClient.chat.completions.create({
                model: this.defaultModel,
                messages: [{ role: "user", content: "Hello" }],
                max_tokens: 5
            });

            return true;
        } catch (error) {
            console.warn("API密钥验证失败:", error.message);
            return false;
        }
    }

    /**
     * 获取可用模型列表
     */
    async getModels() {
        this._ensureClient();
        
        try {
            const response = await this.client.models.list();
            
            return response.data
                .filter((model) => model.id.includes("gpt"))
                .sort((a, b) => a.id.localeCompare(b.id));
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }

    /**
     * 错误处理
     */
    handleError(error) {
        console.error("OpenAI API 错误:", error);

        // 处理 OpenAI 库的错误类型
        if (error instanceof OpenAI.APIError) {
            const { status, message } = error;

            switch (status) {
                case 401:
                    throw new Error("API密钥无效或已过期");
                case 429:
                    throw new Error("请求过于频繁，请稍后再试");
                case 500:
                case 502:
                case 503:
                    throw new Error("OpenAI服务器错误，请稍后再试");
                default:
                    throw new Error(message || "API请求失败");
            }
        } else if (error instanceof OpenAI.APIConnectionError) {
            throw new Error("网络连接失败，请检查网络设置");
        } else if (error instanceof OpenAI.RateLimitError) {
            throw new Error("请求频率超限，请稍后再试");
        } else if (error instanceof OpenAI.APITimeoutError) {
            throw new Error("请求超时，请稍后再试");
        } else {
            throw new Error(error.message || "未知错误");
        }
    }

    /**
     * sendChatMessageStream 别名方法，兼容性支持
     */
    async sendChatMessageStream(messages, onChunk, options = {}) {
        return this.sendMessageStream(messages, onChunk, options);
    }

    /**
     * 获取当前使用的模型
     */
    getCurrentModel() {
        return this.defaultModel;
    }

    /**
     * 设置默认模型
     */
    setDefaultModel(model) {
        this.defaultModel = model;
    }

    /**
     * 检查客户端是否已初始化
     */
    isInitialized() {
        return this.client !== null;
    }
}

export const openaiService = new OpenAIService();
