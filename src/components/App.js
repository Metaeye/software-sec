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
        <!-- Sidebar -->
        <div id="sidebar" class="${this.state.sidebarOpen ? "block" : "hidden"} lg:block">
        </div>
        
        <!-- Main content area -->
        <div class="flex-1 flex flex-col min-w-0">
          <!-- Top navigation bar -->
          <header class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button 
                id="toggle-sidebar" 
                class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Toggle sidebar"
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
                  <span>Processing...</span>
                </div>
              `
                      : ""
              }
              
              <div class="flex items-center space-x-1">
                <div class="w-2 h-2 rounded-full ${this.state.apiKey ? "bg-green-500" : "bg-red-500"}"></div>
                <span class="text-sm text-gray-500">
                  ${this.state.apiKey ? "API Connected" : "API Not Configured"}
                </span>
              </div>
            </div>
          </header>
          
          <!-- Main content -->
          <main class="flex-1 overflow-hidden">
            <div id="main-content" class="h-full">
            </div>
          </main>
        </div>
        
        <!-- Error toast -->
        <div id="error-toast"></div>
      </div>
    `;

        this.attachEventListeners();
        this.renderComponents();
    }

    /**
     * Get page title
     */
    getPageTitle() {
        switch (this.state.currentView) {
            case "chat":
                return "AI Chat";
            case "settings":
                return "Settings";
            case "files":
                return "File Management";
            default:
                return "AI Assistant";
        }
    }

    /**
     * Render child components
     */
    renderComponents() {
        // Render sidebar
        const sidebarElement = document.getElementById("sidebar");
        if (sidebarElement) {
            this.sidebar.render(sidebarElement);
        }

        // Render main content
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

        // Render error toast
        const errorToastElement = document.getElementById("error-toast");
        if (errorToastElement) {
            this.errorToast.render(errorToastElement);
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Toggle sidebar
        const toggleSidebar = document.getElementById("toggle-sidebar");
        if (toggleSidebar) {
            toggleSidebar.addEventListener("click", () => {
                appStore.toggleSidebar();
            });
        }

        // Responsive handling
        this.handleResize();
        window.addEventListener("resize", () => this.handleResize());

        // Keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            // Ctrl/Cmd + K to open settings
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                appStore.setCurrentView("settings");
            }

            // Ctrl/Cmd + N for new conversation
            if ((e.ctrlKey || e.metaKey) && e.key === "n") {
                e.preventDefault();
                appStore.startNewChat();
                appStore.setCurrentView("chat");
            }
        });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const isMobile = window.innerWidth < 1024;

        if (isMobile && this.state.sidebarOpen) {
            // On mobile devices, close sidebar when clicking main content area
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
     * Initialize application
     */
    init() {
        // Check API key
        if (!this.state.apiKey) {
            appStore.setCurrentView("settings");
        }

        this.render();
    }

    /**
     * Destroy component
     */
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        // Clean up child components
        this.sidebar.destroy?.();
        this.chatContainer.destroy?.();
        this.settingsPanel.destroy?.();
        this.filePanel.destroy?.();
        this.errorToast.destroy?.();
    }
}
