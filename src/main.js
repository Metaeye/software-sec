/**
 * OpenAI Chat Application
 * 基于Vite的现代化AI对话应用
 */

import "./style.css";
import { App } from "./components/App.js";
import { appStore } from "./stores/appStore.js";

/**
 * 应用初始化
 */
class Application {
    constructor() {
        this.app = null;
        this.init();
    }

    /**
     * 初始化应用
     */
    async init() {
        try {
            // 显示加载状态
            this.showLoadingScreen();

            // 初始化应用状态
            await this.initializeAppState();

            // 创建应用实例
            this.app = new App();

            // 渲染应用
            const appContainer = document.querySelector("#app");
            if (appContainer) {
                this.app.render(appContainer);
            } else {
                throw new Error("找不到应用容器元素");
            }

            // 隐藏加载屏幕
            this.hideLoadingScreen();

            // 设置全局错误处理
            this.setupGlobalErrorHandling();

            console.log("🚀 OpenAI Chat Application 启动成功");
        } catch (error) {
            console.error("应用初始化失败:", error);
            this.showErrorScreen(error.message);
        }
    }

    /**
     * 显示加载屏幕
     */
    showLoadingScreen() {
        const appContainer = document.querySelector("#app");
        if (appContainer) {
            appContainer.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            
            <h1 class="text-2xl font-bold text-gray-900 mb-2">OpenAI Chat</h1>
            <p class="text-gray-600 mb-6">正在初始化应用...</p>
            
            <div class="flex items-center justify-center space-x-2">
              <div class="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        </div>
      `;
        }
    }

    /**
     * 隐藏加载屏幕
     */
    hideLoadingScreen() {
        // 添加淡出效果
        const loadingScreen = document.querySelector(".min-h-screen.bg-gradient-to-br");
        if (loadingScreen) {
            loadingScreen.style.opacity = "0";
            loadingScreen.style.transition = "opacity 0.3s ease-out";
            setTimeout(() => {
                if (loadingScreen.parentNode) {
                    loadingScreen.parentNode.removeChild(loadingScreen);
                }
            }, 300);
        }
    }

    /**
     * 显示错误屏幕
     */
    showErrorScreen(errorMessage) {
        const appContainer = document.querySelector("#app");
        if (appContainer) {
            appContainer.innerHTML = `
        <div class="min-h-screen bg-red-50 flex items-center justify-center">
          <div class="text-center max-w-md mx-auto p-6">
            <div class="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            
            <h1 class="text-2xl font-bold text-gray-900 mb-2">应用启动失败</h1>
            <p class="text-gray-600 mb-6">${errorMessage}</p>
            
            <button 
              onclick="window.location.reload()" 
              class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      `;
        }
    }

    /**
     * 初始化应用状态
     */
    async initializeAppState() {
        try {
            // 从本地存储恢复状态
            const savedApiKey = localStorage.getItem("openai_api_key");
            if (savedApiKey) {
                appStore.setApiKey(savedApiKey);
            }

            const savedModel = localStorage.getItem("openai_model");
            if (savedModel) {
                appStore.setState({ currentModel: savedModel });
            }

            // 恢复聊天历史（可选）
            const savedMessages = localStorage.getItem("chat_messages");
            if (savedMessages) {
                try {
                    const messages = JSON.parse(savedMessages);
                    if (Array.isArray(messages)) {
                        appStore.setState({ messages });
                    }
                } catch (error) {
                    console.warn("恢复聊天历史失败:", error);
                }
            }

            console.log("应用状态初始化完成");
        } catch (error) {
            console.error("初始化应用状态失败:", error);
            throw error;
        }
    }

    /**
     * 设置全局错误处理
     */
    setupGlobalErrorHandling() {
        // 捕获未处理的Promise错误
        window.addEventListener("unhandledrejection", (event) => {
            console.error("未处理的Promise错误:", event.reason);
            appStore.setError(`系统错误: ${event.reason?.message || "未知错误"}`);
            event.preventDefault();
        });

        // 捕获全局JavaScript错误
        window.addEventListener("error", (event) => {
            console.error("全局JavaScript错误:", event.error);
            appStore.setError(`系统错误: ${event.error?.message || "未知错误"}`);
        });

        // 监听应用状态变化，自动保存重要数据
        appStore.subscribe((state) => {
            // 保存API密钥
            if (state.apiKey) {
                localStorage.setItem("openai_api_key", state.apiKey);
            } else {
                localStorage.removeItem("openai_api_key");
            }

            // 保存当前模型
            if (state.currentModel) {
                localStorage.setItem("openai_model", state.currentModel);
            }

            // 保存聊天历史（限制数量避免存储过大）
            if (state.messages && state.messages.length > 0) {
                const messagesToSave = state.messages.slice(-50); // 只保存最近50条消息
                localStorage.setItem("chat_messages", JSON.stringify(messagesToSave));
            }
        });
    }

    /**
     * 销毁应用
     */
    destroy() {
        if (this.app && typeof this.app.destroy === "function") {
            this.app.destroy();
        }
    }
}

// 启动应用
const application = new Application();

// 导出应用实例（用于调试）
window.app = application;
