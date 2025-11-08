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
              <span class="font-semibold text-gray-800">AI Assistant - Filtered</span>
            </div>
          </div>
          
          <button 
            id="new-chat-btn" 
            class="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span>New Chat</span>
          </button>
        </div>

        <!-- Navigation menu -->
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
              <span>Chat</span>
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
              <span>Files</span>
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
              <span>Settings</span>
            </button>
          </nav>
        </div>

        <!-- Chat history -->
        <div class="flex-1 overflow-hidden">
          <div class="p-4">
            <h3 class="text-sm font-medium text-gray-500 mb-3">Chat History</h3>
            <div id="chat-history" class="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
              ${this.renderChatHistory()}
            </div>
          </div>
        </div>

        <!-- Bottom status -->
        <div class="p-4 border-t border-gray-200">
          <div class="flex items-center justify-between text-sm text-gray-500">
            <span>Messages: ${this.state.messages.length}</span>
            <div class="flex items-center space-x-1">
              <div class="w-2 h-2 rounded-full ${this.state.apiKey ? "bg-green-500" : "bg-red-500"}"></div>
              <span>${this.state.apiKey ? "Connected" : "Disconnected"}</span>
            </div>
          </div>
        </div>
      </div>
    `;

        this.attachEventListeners();
    }

    /**
     * Render chat history
     */
    renderChatHistory() {
        if (this.state.conversations.length === 0) {
            return `
        <div class="text-center text-gray-400 py-8">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <p class="text-sm">No chat history</p>
        </div>
      `;
        }

        return this.state.conversations
            .sort((a, b) => b.updatedAt - a.updatedAt) // 按更新时间排序，最新的在前
            .map(
                (conversation) => `
      <div class="chat-history-item p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 ${
          this.state.currentConversationId === conversation.id ? 'bg-primary-50 border-primary-200' : ''
      }" data-conversation-id="${conversation.id}">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
          </div>
          <div class="flex-1 min-w-0 cursor-pointer" data-action="load-conversation">
            <p class="text-sm font-medium text-gray-800 truncate">
              ${conversation.title}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              ${formatTime(conversation.updatedAt)}
            </p>
            <p class="text-xs text-gray-400 mt-1">
              ${conversation.messages.length} messages
            </p>
          </div>
          <div class="flex-shrink-0">
            <button 
              class="delete-conversation-btn p-1 text-gray-400 hover:text-red-600 transition-colors rounded"
              data-action="delete-conversation"
              data-conversation-id="${conversation.id}"
              title="Delete conversation"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `
            )
            .join("");
    }

    /**
     * Group messages by conversation
     */
    groupMessagesByConversation() {
        const conversations = [];
        let currentConversation = null;
        let conversationId = 0;

        this.state.messages.forEach((message, index) => {
            // 检查是否是对话的开始
            // 新对话开始的条件：
            // 1. 是用户消息
            // 2. 且（没有当前对话 或 当前对话已经完整结束）
            const isNewConversation = message.role === "user" && 
                (!currentConversation || 
                 this.isConversationComplete(currentConversation));

            if (isNewConversation) {
                // 保存当前对话
                if (currentConversation) {
                    conversations.push(currentConversation);
                }

                // 开始新对话
                currentConversation = {
                    id: `conv_${conversationId++}`,
                    title: message.content.substring(0, 30) + (message.content.length > 30 ? "..." : ""),
                    timestamp: message.timestamp || Date.now(),
                    messageCount: 1,
                    messages: [message],
                };
            } else if (currentConversation) {
                // 添加到当前对话
                currentConversation.messageCount++;
                currentConversation.messages.push(message);
            }
        });

        if (currentConversation) {
            conversations.push(currentConversation);
        }

        return conversations.reverse(); // Latest first
    }

    /**
     * 检查对话是否完整（以助手消息结束）
     */
    isConversationComplete(conversation) {
        if (!conversation || conversation.messages.length === 0) return false;
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        return lastMessage.role === "assistant";
    }

    /**
     * Update content
     */
    updateContent() {
        if (!this.container) return;

        // Update navigation state
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

        // Update chat history
        const chatHistory = this.container.querySelector("#chat-history");
        if (chatHistory) {
            chatHistory.innerHTML = this.renderChatHistory();
            this.attachChatHistoryListeners();
        }

        // Update file count
        const filesNav = this.container.querySelector("#nav-files");
        if (filesNav && this.state.uploadedFiles.length > 0) {
            const badge = filesNav.querySelector(".bg-primary-100");
            if (badge) {
                badge.textContent = this.state.uploadedFiles.length;
            }
        }

        // Update bottom status
        const messageCount = this.container.querySelector(".p-4.border-t span");
        if (messageCount) {
            messageCount.textContent = `Messages: ${this.state.messages.length}`;
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // New chat
        const newChatBtn = this.container.querySelector("#new-chat-btn");
        if (newChatBtn) {
            newChatBtn.addEventListener("click", () => {
                appStore.startNewChat();
                appStore.setCurrentView("chat");
            });
        }

        // Navigation menu
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

        this.attachChatHistoryListeners();
    }

    /**
     * Attach chat history listeners
     */
    attachChatHistoryListeners() {
        const historyItems = this.container.querySelectorAll(".chat-history-item");
        historyItems.forEach((item) => {
            // 处理对话加载点击
            const loadArea = item.querySelector('[data-action="load-conversation"]');
            if (loadArea) {
                loadArea.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const conversationId = item.dataset.conversationId;
                    console.log("Clicked conversation:", conversationId); // 调试信息
                    
                    if (conversationId) {
                        appStore.loadConversation(conversationId);
                        appStore.setCurrentView("chat");
                    }
                });
            }

            // 处理删除按钮点击
            const deleteBtn = item.querySelector('[data-action="delete-conversation"]');
            if (deleteBtn) {
                deleteBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const conversationId = deleteBtn.dataset.conversationId;
                    console.log("Delete button clicked for conversation:", conversationId); // 调试信息
                    
                    if (conversationId) {
                        this.deleteConversation(conversationId);
                    }
                });
            }
        });
    }

    /**
     * Delete conversation
     */
    deleteConversation(conversationId) {
        console.log("Attempting to delete conversation:", conversationId); // 调试信息
        if (confirm("Are you sure you want to delete this conversation? This action cannot be undone.")) {
            console.log("User confirmed deletion"); // 调试信息
            appStore.deleteConversation(conversationId);
        } else {
            console.log("User cancelled deletion"); // 调试信息
        }
    }

    /**
     * Destroy component
     */
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}
