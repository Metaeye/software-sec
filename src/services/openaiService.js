/**
 * OpenAI API 服务
 * 处理与OpenAI API的所有交互
 */

import axios from "axios";

class OpenAIService {
    constructor() {
        this.baseURL = "https://api.openai.com/v1";
        this.defaultModel = "gpt-3.5-turbo";
    }

    /**
     * 设置API密钥
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * 获取请求头
     */
    getHeaders() {
        if (!this.apiKey) {
            throw new Error("API密钥未设置");
        }

        return {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
        };
    }

    /**
     * 发送聊天消息
     */
    async sendMessage(messages, options = {}) {
        try {
            const response = await axios.post(
                `${this.baseURL}/chat/completions`,
                {
                    model: options.model || this.defaultModel,
                    messages: messages,
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 2000,
                    stream: options.stream || false,
                },
                {
                    headers: this.getHeaders(),
                }
            );

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * 流式发送消息
     */
    async sendMessageStream(messages, onChunk, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: "POST",
                headers: this.getHeaders(),
                body: JSON.stringify({
                    model: options.model || this.defaultModel,
                    messages: messages,
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 2000,
                    stream: true,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop(); // 保留不完整的行

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = line.slice(6);

                        if (data === "[DONE]") {
                            return;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content;

                            if (content) {
                                onChunk(content);
                            }
                        } catch (e) {
                            console.warn("解析流数据失败:", e);
                        }
                    }
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
            const tempService = new OpenAIService();
            tempService.setApiKey(apiKey);

            await tempService.sendMessage([{ role: "user", content: "Hello" }], { maxTokens: 5 });

            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 获取可用模型列表
     */
    async getModels() {
        try {
            const response = await axios.get(`${this.baseURL}/models`, {
                headers: this.getHeaders(),
            });

            return response.data.data
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

        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    throw new Error("API密钥无效或已过期");
                case 429:
                    throw new Error("请求过于频繁，请稍后再试");
                case 500:
                    throw new Error("OpenAI服务器错误，请稍后再试");
                default:
                    throw new Error(data?.error?.message || "请求失败");
            }
        } else if (error.request) {
            throw new Error("网络连接失败，请检查网络设置");
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
}

export const openaiService = new OpenAIService();
