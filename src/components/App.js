/**
 * 主应用组件
 * 管理整体布局和路由
 */

import { appStore } from "../stores/appStore.js";
import { Sidebar } from "./Sidebar.js";
import { ChatContainer } from "./ChatContainer.js";
import { SettingsPanel } from "./SettingsPanel.js";
import { FilePanel } from "./FilePanel.js";
import { ErrorToast } from "./ErrorToast.js";

export class App {
    constructor() {
        this.state = appStore.getState();
        this.unsubscribe = appStore.subscribe((newState) => {
            this.state = newState;
            this.render();
        });

        this.sidebar = new Sidebar();
        this.chatContainer = new ChatContainer();
        this.settingsPanel = new SettingsPanel();
        this.filePanel = new FilePanel();
        this.errorToast = new ErrorToast();
    }

    /**
     * 渲染应用
     */
    render() {
        const app = document.getElementById("app");

        app.innerHTML = `
      <div class="flex h-screen bg-gray-50 font-sans">
        <!-- 侧边栏 -->
        <div id="sidebar" class="${this.state.sidebarOpen ? "block" : "hidden"} lg:block">
        </div>
        
        <!-- 主内容区域 -->
        <div class="flex-1 flex flex-col min-w-0">
          <!-- 顶部导航栏 -->
          <header class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button 
                id="toggle-sidebar" 
                class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="切换侧边栏"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              
              <h1 class="text-xl font-semibold text-gray-800">
                ${this.getPageTitle()}
              </h1>
            </div>
            
            <div class="flex items-center space-x-2">
              ${
                  this.state.isLoading
                      ? `
                <div class="flex items-center space-x-2 text-sm text-gray-500">
                  <div class="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
                  <span>处理中...</span>
                </div>
              `
                      : ""
              }
              
              <div class="flex items-center space-x-1">
                <div class="w-2 h-2 rounded-full ${this.state.apiKey ? "bg-green-500" : "bg-red-500"}"></div>
                <span class="text-sm text-gray-500">
                  ${this.state.apiKey ? "API已连接" : "API未配置"}
                </span>
              </div>
            </div>
          </header>
          
          <!-- 主内容 -->
          <main class="flex-1 overflow-hidden">
            <div id="main-content" class="h-full">
            </div>
          </main>
        </div>
        
        <!-- 错误提示 -->
        <div id="error-toast"></div>
      </div>
    `;

        this.attachEventListeners();
        this.renderComponents();
    }

    /**
     * 获取页面标题
     */
    getPageTitle() {
        switch (this.state.currentView) {
            case "chat":
                return "AI 对话";
            case "settings":
                return "设置";
            case "files":
                return "文件管理";
            default:
                return "AI 助手";
        }
    }

    /**
     * 渲染子组件
     */
    renderComponents() {
        // 渲染侧边栏
        const sidebarElement = document.getElementById("sidebar");
        if (sidebarElement) {
            this.sidebar.render(sidebarElement);
        }

        // 渲染主内容
        const mainContent = document.getElementById("main-content");
        if (mainContent) {
            switch (this.state.currentView) {
                case "chat":
                    this.chatContainer.render(mainContent);
                    break;
                case "settings":
                    this.settingsPanel.render(mainContent);
                    break;
                case "files":
                    this.filePanel.render(mainContent);
                    break;
            }
        }

        // 渲染错误提示
        const errorToastElement = document.getElementById("error-toast");
        if (errorToastElement) {
            this.errorToast.render(errorToastElement);
        }
    }

    /**
     * 绑定事件监听器
     */
    attachEventListeners() {
        // 切换侧边栏
        const toggleSidebar = document.getElementById("toggle-sidebar");
        if (toggleSidebar) {
            toggleSidebar.addEventListener("click", () => {
                appStore.toggleSidebar();
            });
        }

        // 响应式处理
        this.handleResize();
        window.addEventListener("resize", () => this.handleResize());

        // 键盘快捷键
        document.addEventListener("keydown", (e) => {
            // Ctrl/Cmd + K 打开设置
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                appStore.setCurrentView("settings");
            }

            // Ctrl/Cmd + N 新建对话
            if ((e.ctrlKey || e.metaKey) && e.key === "n") {
                e.preventDefault();
                appStore.clearMessages();
                appStore.setCurrentView("chat");
            }
        });
    }

    /**
     * 处理窗口大小变化
     */
    handleResize() {
        const isMobile = window.innerWidth < 1024;

        if (isMobile && this.state.sidebarOpen) {
            // 在移动设备上，点击主内容区域时关闭侧边栏
            const mainContent = document.getElementById("main-content");
            if (mainContent) {
                mainContent.addEventListener(
                    "click",
                    () => {
                        if (this.state.sidebarOpen) {
                            appStore.setState({ sidebarOpen: false });
                        }
                    },
                    { once: true }
                );
            }
        }
    }

    /**
     * 初始化应用
     */
    init() {
        // 检查API密钥
        if (!this.state.apiKey) {
            appStore.setCurrentView("settings");
        }

        this.render();
    }

    /**
     * 销毁组件
     */
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        // 清理子组件
        this.sidebar.destroy?.();
        this.chatContainer.destroy?.();
        this.settingsPanel.destroy?.();
        this.filePanel.destroy?.();
        this.errorToast.destroy?.();
    }
}
