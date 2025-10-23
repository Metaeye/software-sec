/**
 * 应用状态管理
 * 使用简单的观察者模式实现状态管理
 */

class AppStore {
    constructor() {
        this.state = {
            // API配置
            apiKey: localStorage.getItem("openai_api_key") || "",

            // 聊天相关
            messages: JSON.parse(localStorage.getItem("chat_messages") || "[]"),
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
