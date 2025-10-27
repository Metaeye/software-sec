/**
 * 应用状态管理
 * 使用简单的观察者模式实现状态管理
 */

class AppStore {
    constructor() {
        this.state = {
            // API配置
            apiKey: localStorage.getItem("openai_api_key") || "",

            // 聊天相关 - 启动时总是从空状态开始
            messages: [],
            conversations: JSON.parse(localStorage.getItem("chat_conversations") || "[]"),
            currentConversationId: null,
            isLoading: false,
            currentModel: "gpt-3.5-turbo",

            // 文件上传
            uploadedFiles: [],

            // UI状态
            sidebarOpen: true,
            currentView: "chat", // 'chat', 'settings', 'files'

            // 错误处理
            error: null,
        };

        this.listeners = [];
        
        // 应用启动时总是开始新对话
        this.startNewChat();
    }

    /**
     * 订阅状态变化
     */
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    /**
     * 通知所有监听器
     */
    notify() {
        this.listeners.forEach((listener) => listener(this.state));
    }

    /**
     * 更新状态
     */
    setState(updates) {
        this.state = { ...this.state, ...updates };
        this.notify();
    }

    /**
     * 获取当前状态
     */
    getState() {
        return this.state;
    }

    // API Key 管理
    setApiKey(apiKey) {
        localStorage.setItem("openai_api_key", apiKey);
        this.setState({ apiKey });
    }

    // 消息管理
    addMessage(message) {
        const messages = [...this.state.messages, message];
        localStorage.setItem("chat_messages", JSON.stringify(messages));
        this.setState({ messages });
    }

    removeMessage(messageId) {
        const messages = this.state.messages.filter(msg => msg.id !== messageId);
        localStorage.setItem("chat_messages", JSON.stringify(messages));
        this.setState({ messages });
    }

    updateMessage(messageId, updates) {
        const messages = this.state.messages.map(msg => 
            msg.id === messageId ? { ...msg, ...updates } : msg
        );
        localStorage.setItem("chat_messages", JSON.stringify(messages));
        this.setState({ messages });
    }

    clearMessages() {
        localStorage.removeItem("chat_messages");
        this.setState({ messages: [] });
    }

    // 开始新对话（不清空历史）
    startNewChat() {
        // 保存当前对话（如果有消息的话）
        if (this.state.messages.length > 0) {
            this.saveCurrentConversation();
        }
        
        // 开始新对话 - 清空当前消息并创建新的对话ID
        const newConversationId = Date.now().toString();
        this.setState({ 
            messages: [],
            currentConversationId: newConversationId
        });
        
        // 清空localStorage中的当前消息，确保不会重新加载
        localStorage.removeItem("chat_messages");
    }

    // 保存当前对话
    saveCurrentConversation() {
        if (this.state.messages.length === 0) return;

        const conversations = [...this.state.conversations];
        const existingIndex = conversations.findIndex(c => c.id === this.state.currentConversationId);
        
        if (existingIndex >= 0) {
            // 更新已存在的对话
            conversations[existingIndex] = {
                ...conversations[existingIndex],
                title: this.getConversationTitle(),
                messages: [...this.state.messages],
                updatedAt: Date.now()
            };
        } else {
            // 创建新对话
            const conversation = {
                id: this.state.currentConversationId || Date.now().toString(),
                title: this.getConversationTitle(),
                messages: [...this.state.messages],
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            conversations.push(conversation);
        }

        localStorage.setItem("chat_conversations", JSON.stringify(conversations));
        this.setState({ conversations });
    }

    // 获取对话标题
    getConversationTitle() {
        const firstUserMessage = this.state.messages.find(msg => msg.role === "user");
        if (firstUserMessage) {
            return firstUserMessage.content.substring(0, 30) + 
                   (firstUserMessage.content.length > 30 ? "..." : "");
        }
        return "New Conversation";
    }

    // 加载对话
    loadConversation(conversationId) {
        const conversation = this.state.conversations.find(c => c.id === conversationId);
        if (conversation) {
            this.setState({ 
                messages: conversation.messages,
                currentConversationId: conversationId
            });
        }
    }

    // 删除对话
    deleteConversation(conversationId) {
        console.log("AppStore: Deleting conversation:", conversationId); // 调试信息
        console.log("Current conversations:", this.state.conversations.length); // 调试信息
        
        const conversations = this.state.conversations.filter(c => c.id !== conversationId);
        console.log("After filtering:", conversations.length); // 调试信息
        
        localStorage.setItem("chat_conversations", JSON.stringify(conversations));
        this.setState({ conversations });
        
        // 如果删除的是当前对话，清空消息
        if (this.state.currentConversationId === conversationId) {
            console.log("Deleting current conversation, clearing messages"); // 调试信息
            this.setState({ messages: [], currentConversationId: null });
        }
        
        console.log("Conversation deleted successfully"); // 调试信息
    }

    // 加载状态管理
    setLoading(isLoading) {
        this.setState({ isLoading });
    }

    // 错误管理
    setError(error) {
        this.setState({ error });
        if (error) {
            setTimeout(() => this.setState({ error: null }), 5000);
        }
    }

    // 文件管理
    addFile(file) {
        const uploadedFiles = [...this.state.uploadedFiles, file];
        this.setState({ uploadedFiles });
    }

    removeFile(fileId) {
        const uploadedFiles = this.state.uploadedFiles.filter((f) => f.id !== fileId);
        this.setState({ uploadedFiles });
    }

    // UI状态管理
    toggleSidebar() {
        this.setState({ sidebarOpen: !this.state.sidebarOpen });
    }

    setCurrentView(view) {
        this.setState({ currentView: view });
    }
}

// 创建全局实例
export const appStore = new AppStore();
