/**
 * 侧边栏组件
 * 包含导航菜单和聊天历史
 */

import { appStore } from "../stores/appStore.js";
import { formatTime } from "../utils/helpers.js";

export class Sidebar {
    constructor() {
        this.state = appStore.getState();
        this.unsubscribe = appStore.subscribe((newState) => {
            this.state = newState;
            this.updateContent();
        });
    }

    /**
     * 渲染侧边栏
     */
    render(container) {
        this.container = container;

        container.innerHTML = `
      <div class="sidebar h-full">
        <!-- 顶部Logo和新建按钮 -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <span class="font-semibold text-gray-800">AI 助手</span>
            </div>
          </div>
          
          <button 
            id="new-chat-btn" 
            class="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span>新建对话</span>
          </button>
        </div>

        <!-- 导航菜单 -->
        <div class="p-4 border-b border-gray-200">
          <nav class="space-y-2">
            <button 
              id="nav-chat" 
              class="nav-item w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  this.state.currentView === "chat"
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-100"
              }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              <span>对话</span>
            </button>
            
            <button 
              id="nav-files" 
              class="nav-item w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  this.state.currentView === "files"
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-100"
              }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
              <span>文件</span>
              ${
                  this.state.uploadedFiles.length > 0
                      ? `
                <span class="ml-auto bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full">
                  ${this.state.uploadedFiles.length}
                </span>
              `
                      : ""
              }
            </button>
            
            <button 
              id="nav-settings" 
              class="nav-item w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  this.state.currentView === "settings"
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-100"
              }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span>设置</span>
            </button>
          </nav>
        </div>

        <!-- 聊天历史 -->
        <div class="flex-1 overflow-hidden">
          <div class="p-4">
            <h3 class="text-sm font-medium text-gray-500 mb-3">聊天历史</h3>
            <div id="chat-history" class="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
              ${this.renderChatHistory()}
            </div>
          </div>
        </div>

        <!-- 底部状态 -->
        <div class="p-4 border-t border-gray-200">
          <div class="flex items-center justify-between text-sm text-gray-500">
            <span>消息数: ${this.state.messages.length}</span>
            <div class="flex items-center space-x-1">
              <div class="w-2 h-2 rounded-full ${this.state.apiKey ? "bg-green-500" : "bg-red-500"}"></div>
              <span>${this.state.apiKey ? "已连接" : "未连接"}</span>
            </div>
          </div>
        </div>
      </div>
    `;

        this.attachEventListeners();
    }

    /**
     * 渲染聊天历史
     */
    renderChatHistory() {
        if (this.state.messages.length === 0) {
            return `
        <div class="text-center text-gray-400 py-8">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <p class="text-sm">暂无聊天记录</p>
        </div>
      `;
        }

        // 按对话分组消息
        const conversations = this.groupMessagesByConversation();

        return conversations
            .map(
                (conversation) => `
      <div class="chat-history-item p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-800 truncate">
              ${conversation.title}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              ${formatTime(conversation.timestamp)}
            </p>
            <p class="text-xs text-gray-400 mt-1">
              ${conversation.messageCount} 条消息
            </p>
          </div>
        </div>
      </div>
    `
            )
            .join("");
    }

    /**
     * 按对话分组消息
     */
    groupMessagesByConversation() {
        const conversations = [];
        let currentConversation = null;

        this.state.messages.forEach((message, index) => {
            if (message.role === "user") {
                if (currentConversation) {
                    conversations.push(currentConversation);
                }

                currentConversation = {
                    id: `conv_${index}`,
                    title: message.content.substring(0, 30) + (message.content.length > 30 ? "..." : ""),
                    timestamp: message.timestamp || Date.now(),
                    messageCount: 1,
                    messages: [message],
                };
            } else if (currentConversation) {
                currentConversation.messageCount++;
                currentConversation.messages.push(message);
            }
        });

        if (currentConversation) {
            conversations.push(currentConversation);
        }

        return conversations.reverse(); // 最新的在前面
    }

    /**
     * 更新内容
     */
    updateContent() {
        if (!this.container) return;

        // 更新导航状态
        const navItems = this.container.querySelectorAll(".nav-item");
        navItems.forEach((item) => {
            const isActive =
                (item.id === "nav-chat" && this.state.currentView === "chat") ||
                (item.id === "nav-files" && this.state.currentView === "files") ||
                (item.id === "nav-settings" && this.state.currentView === "settings");

            if (isActive) {
                item.className = item.className.replace(
                    /text-gray-600 hover:bg-gray-100/,
                    "bg-primary-50 text-primary-700"
                );
            } else {
                item.className = item.className.replace(
                    /bg-primary-50 text-primary-700/,
                    "text-gray-600 hover:bg-gray-100"
                );
            }
        });

        // 更新聊天历史
        const chatHistory = this.container.querySelector("#chat-history");
        if (chatHistory) {
            chatHistory.innerHTML = this.renderChatHistory();
        }

        // 更新文件数量
        const filesNav = this.container.querySelector("#nav-files");
        if (filesNav && this.state.uploadedFiles.length > 0) {
            const badge = filesNav.querySelector(".bg-primary-100");
            if (badge) {
                badge.textContent = this.state.uploadedFiles.length;
            }
        }

        // 更新底部状态
        const messageCount = this.container.querySelector(".p-4.border-t span");
        if (messageCount) {
            messageCount.textContent = `消息数: ${this.state.messages.length}`;
        }
    }

    /**
     * 绑定事件监听器
     */
    attachEventListeners() {
        // 新建对话
        const newChatBtn = this.container.querySelector("#new-chat-btn");
        if (newChatBtn) {
            newChatBtn.addEventListener("click", () => {
                appStore.clearMessages();
                appStore.setCurrentView("chat");
            });
        }

        // 导航菜单
        const navChat = this.container.querySelector("#nav-chat");
        if (navChat) {
            navChat.addEventListener("click", () => {
                appStore.setCurrentView("chat");
            });
        }

        const navFiles = this.container.querySelector("#nav-files");
        if (navFiles) {
            navFiles.addEventListener("click", () => {
                appStore.setCurrentView("files");
            });
        }

        const navSettings = this.container.querySelector("#nav-settings");
        if (navSettings) {
            navSettings.addEventListener("click", () => {
                appStore.setCurrentView("settings");
            });
        }

        // 聊天历史项点击
        const historyItems = this.container.querySelectorAll(".chat-history-item");
        historyItems.forEach((item) => {
            item.addEventListener("click", () => {
                appStore.setCurrentView("chat");
                // 这里可以添加加载特定对话的逻辑
            });
        });
    }

    /**
     * 销毁组件
     */
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}
