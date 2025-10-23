/**
 * 聊天容器组件
 * 管理对话界面和消息显示
 */

import { appStore } from "../stores/appStore.js";
import { openaiService } from "../services/openaiService.js";
import { fileService } from "../services/fileService.js";
import { formatTime, escapeHtml, copyToClipboard } from "../utils/helpers.js";

export class ChatContainer {
    constructor() {
        this.state = appStore.getState();
        this.unsubscribe = appStore.subscribe((newState) => {
            this.state = newState;
            this.updateContent();
        });

        this.isStreaming = false;
        this.currentStreamingMessage = null;
        this.streamingContent = "";
    }

    /**
     * 渲染聊天容器
     */
    render(container) {
        this.container = container;

        container.innerHTML = `
      <div class="h-full bg-white flex flex-col">
        <!-- 聊天头部 -->
        <div class="border-b border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">AI 助手</h2>
                <p class="text-sm text-gray-500">
                  ${this.state.apiKey ? `模型: ${this.state.currentModel}` : "请先配置 API Key"}
                </p>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <!-- 连接状态 -->
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 rounded-full ${this.state.apiKey ? "bg-green-500" : "bg-red-500"}"></div>
                <span class="text-xs text-gray-500">
                  ${this.state.apiKey ? "已连接" : "未连接"}
                </span>
              </div>
              
              <!-- 清空对话按钮 -->
              <button 
                id="clear-chat-btn" 
                class="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                title="清空对话"
                ${this.state.messages.length === 0 ? "disabled" : ""}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 消息列表 -->
        <div class="flex-1 overflow-hidden">
          <div id="messages-container" class="h-full overflow-y-auto scrollbar-thin">
            <div id="messages-list" class="p-4 space-y-4">
              ${this.renderMessages()}
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="border-t border-gray-200 p-4">
          ${this.renderInputArea()}
        </div>
      </div>
    `;

        this.attachEventListeners();
        this.scrollToBottom();
    }

    /**
     * 渲染消息列表
     */
    renderMessages() {
        if (this.state.messages.length === 0) {
            return `
        <div class="text-center py-12">
          <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">开始新对话</h3>
          <p class="text-gray-500 mb-6">向 AI 助手提问任何问题，或上传文件进行分析</p>
          
          <!-- 快速开始建议 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
            <button class="suggestion-btn text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <div class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-primary-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                <div>
                  <p class="font-medium text-gray-900">解释概念</p>
                  <p class="text-sm text-gray-500">让我解释复杂的概念或技术</p>
                </div>
              </div>
            </button>
            
            <button class="suggestion-btn text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <div class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-primary-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                </svg>
                <div>
                  <p class="font-medium text-gray-900">代码帮助</p>
                  <p class="text-sm text-gray-500">编写、调试或优化代码</p>
                </div>
              </div>
            </button>
            
            <button class="suggestion-btn text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <div class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-primary-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <div>
                  <p class="font-medium text-gray-900">文档分析</p>
                  <p class="text-sm text-gray-500">上传文件进行内容分析</p>
                </div>
              </div>
            </button>
            
            <button class="suggestion-btn text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <div class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-primary-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                <div>
                  <p class="font-medium text-gray-900">创意写作</p>
                  <p class="text-sm text-gray-500">帮助创作文章、故事或方案</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      `;
        }

        return this.state.messages.map((message) => this.renderMessage(message)).join("");
    }

    /**
     * 渲染单个消息
     */
    renderMessage(message) {
        const isUser = message.role === "user";
        const time = formatTime(message.timestamp);

        return `
      <div class="message-bubble ${isUser ? "user" : "assistant"} fade-in">
        <div class="flex ${isUser ? "justify-end" : "justify-start"} space-x-3">
          ${
              !isUser
                  ? `
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
          `
                  : ""
          }
          
          <div class="max-w-3xl ${isUser ? "order-first" : ""}">
            <div class="message-content ${
                isUser ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-900"
            } rounded-2xl px-4 py-3 ${isUser ? "rounded-br-md" : "rounded-bl-md"}">
              <div class="message-text whitespace-pre-wrap">${this.formatMessageContent(message.content)}</div>
            </div>
            
            <div class="flex items-center ${isUser ? "justify-end" : "justify-start"} mt-2 space-x-2">
              <span class="text-xs text-gray-500">${time}</span>
              
              ${
                  !isUser
                      ? `
                <button 
                  class="copy-btn text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  data-content="${escapeHtml(message.content)}"
                  title="复制消息"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </button>
              `
                      : ""
              }
            </div>
          </div>
          
          ${
              isUser
                  ? `
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
            </div>
          `
                  : ""
          }
        </div>
      </div>
    `;
    }

    /**
     * 格式化消息内容
     */
    formatMessageContent(content) {
        // 转义HTML
        let formatted = escapeHtml(content);

        // 处理代码块
        formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<div class="code-block bg-gray-800 text-gray-100 rounded-lg p-4 my-3 overflow-x-auto">
        ${lang ? `<div class="text-xs text-gray-400 mb-2">${lang}</div>` : ""}
        <pre class="text-sm font-mono">${code.trim()}</pre>
      </div>`;
        });

        // 处理行内代码
        formatted = formatted.replace(
            /`([^`]+)`/g,
            '<code class="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>'
        );

        // 处理粗体
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        // 处理斜体
        formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");

        // 处理链接
        formatted = formatted.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        return formatted;
    }

    /**
     * 渲染输入区域
     */
    renderInputArea() {
        const hasFiles = this.state.uploadedFiles.length > 0;

        return `
      <div class="space-y-3">
        <!-- 文件引用 -->
        ${
            hasFiles
                ? `
          <div class="flex items-center space-x-2 text-sm text-gray-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
            </svg>
            <span>已上传 ${this.state.uploadedFiles.length} 个文件</span>
            <button 
              id="toggle-files-btn" 
              class="text-primary-600 hover:text-primary-800 transition-colors"
            >
              查看文件
            </button>
          </div>
        `
                : ""
        }
        
        <!-- 输入框 -->
        <div class="flex items-end space-x-3">
          <div class="flex-1 relative">
            <textarea
              id="message-input"
              placeholder="${this.state.apiKey ? "输入您的消息..." : "请先在设置中配置 API Key"}"
              class="input-field resize-none min-h-[44px] max-h-32 pr-12"
              rows="1"
              ${!this.state.apiKey || this.state.loading ? "disabled" : ""}
            ></textarea>
            
            <!-- 文件上传按钮 -->
            <button
              id="file-upload-btn"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-100 touch-manipulation"
              title="上传文件"
              ${!this.state.apiKey || this.state.loading ? "disabled" : ""}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
              </svg>
            </button>
            
            <!-- 隐藏的文件输入 -->
            <input
              type="file"
              id="file-input"
              class="hidden"
              multiple
              accept=".txt,.md,.json,.csv,.xml,.html,.css,.js,.py,.java,.cpp,.c,.h,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.tar,.gz,.jpg,.jpeg,.png,.gif,.bmp,.svg,.webp"
            />
          </div>
          
          <button
            id="send-btn"
            class="btn-primary px-4 py-2 ${
                !this.state.apiKey || this.state.loading ? "opacity-50 cursor-not-allowed" : ""
            }"
            ${!this.state.apiKey || this.state.loading ? "disabled" : ""}
          >
            ${
                this.state.loading
                    ? `
              <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            `
                    : `
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            `
            }
          </button>
        </div>
        
        <!-- 文件上传进度 -->
        <div id="upload-progress" class="hidden">
          <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">上传文件</span>
              <button id="cancel-upload-btn" class="text-gray-400 hover:text-red-600 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div id="upload-file-list" class="space-y-2"></div>
          </div>
        </div>
        
        <!-- 快捷操作 -->
        <div class="flex items-center justify-between text-xs text-gray-500">
          <div class="flex items-center space-x-4">
            <span>按 Enter 发送，Shift + Enter 换行</span>
            ${
                hasFiles
                    ? `
              <button 
                id="clear-files-btn" 
                class="text-red-500 hover:text-red-700 transition-colors"
              >
                清空文件
              </button>
            `
                    : ""
            }
          </div>
          
          <div class="flex items-center space-x-2">
            <span>字符数: <span id="char-count">0</span></span>
          </div>
        </div>
      </div>
    `;
    }

    /**
     * 更新内容
     */
    updateContent() {
        if (!this.container) return;

        // 更新消息列表
        const messagesList = this.container.querySelector("#messages-list");
        if (messagesList) {
            messagesList.innerHTML = this.renderMessages();
            this.attachMessageListeners();
            this.scrollToBottom();
        }

        // 更新输入区域
        const inputArea = this.container.querySelector(".border-t.border-gray-200 .space-y-3");
        if (inputArea) {
            inputArea.innerHTML = this.renderInputArea().replace('<div class="space-y-3">', "").replace("</div>", "");
            this.attachInputListeners();
        }

        // 更新头部状态
        this.updateHeaderStatus();
    }

    /**
     * 更新头部状态
     */
    updateHeaderStatus() {
        const statusDot = this.container.querySelector(".w-2.h-2.rounded-full");
        const statusText = this.container.querySelector(".text-xs.text-gray-500");
        const modelText = this.container.querySelector(".text-sm.text-gray-500");

        if (statusDot && statusText) {
            if (this.state.apiKey) {
                statusDot.className = "w-2 h-2 rounded-full bg-green-500";
                statusText.textContent = "已连接";
            } else {
                statusDot.className = "w-2 h-2 rounded-full bg-red-500";
                statusText.textContent = "未连接";
            }
        }

        if (modelText) {
            modelText.textContent = this.state.apiKey ? `模型: ${this.state.currentModel}` : "请先配置 API Key";
        }
    }

    /**
     * 绑定事件监听器
     */
    attachEventListeners() {
        // 清空对话按钮
        const clearChatBtn = this.container.querySelector("#clear-chat-btn");
        if (clearChatBtn) {
            clearChatBtn.addEventListener("click", () => {
                if (confirm("确定要清空所有对话记录吗？")) {
                    appStore.clearMessages();
                }
            });
        }

        // 建议按钮
        const suggestionBtns = this.container.querySelectorAll(".suggestion-btn");
        suggestionBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                const suggestion = btn.querySelector("p").textContent;
                const input = this.container.querySelector("#message-input");
                if (input) {
                    input.value = `请帮我${suggestion.toLowerCase()}`;
                    input.focus();
                }
            });
        });

        this.attachInputListeners();
        this.attachMessageListeners();
    }

    /**
     * 绑定输入区域事件
     */
    attachInputListeners() {
        const messageInput = this.container.querySelector("#message-input");
        const sendBtn = this.container.querySelector("#send-btn");
        const charCount = this.container.querySelector("#char-count");
        const toggleFilesBtn = this.container.querySelector("#toggle-files-btn");
        const clearFilesBtn = this.container.querySelector("#clear-files-btn");

        if (messageInput) {
            // 自动调整高度
            messageInput.addEventListener("input", () => {
                messageInput.style.height = "auto";
                messageInput.style.height = Math.min(messageInput.scrollHeight, 128) + "px";

                // 更新字符计数
                if (charCount) {
                    charCount.textContent = messageInput.value.length;
                }
            });

            // 键盘事件
            messageInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        if (sendBtn) {
            sendBtn.addEventListener("click", () => {
                this.sendMessage();
            });
        }

        if (toggleFilesBtn) {
            toggleFilesBtn.addEventListener("click", () => {
                appStore.setCurrentView("files");
            });
        }

        if (clearFilesBtn) {
            clearFilesBtn.addEventListener("click", () => {
                if (confirm("确定要清空所有上传的文件吗？")) {
                    appStore.clearFiles();
                }
            });
        }

        // 文件上传按钮
        const fileUploadBtn = this.container.querySelector("#file-upload-btn");
        const fileInput = this.container.querySelector("#file-input");

        if (fileUploadBtn && fileInput) {
            fileUploadBtn.addEventListener("click", () => {
                fileInput.click();
            });

            fileInput.addEventListener("change", (e) => {
                this.handleFileUpload(e.target.files);
            });
        }

        // 文件上传进度取消按钮
        const cancelUploadBtn = this.container.querySelector("#cancel-upload-btn");
        if (cancelUploadBtn) {
            cancelUploadBtn.addEventListener("click", () => {
                this.cancelFileUpload();
            });
        }

        // 拖拽上传到输入框
        if (messageInput) {
            messageInput.addEventListener("dragover", (e) => {
                e.preventDefault();
                messageInput.classList.add("border-primary-500", "bg-primary-50");
            });

            messageInput.addEventListener("dragleave", (e) => {
                e.preventDefault();
                messageInput.classList.remove("border-primary-500", "bg-primary-50");
            });

            messageInput.addEventListener("drop", (e) => {
                e.preventDefault();
                messageInput.classList.remove("border-primary-500", "bg-primary-50");

                const files = Array.from(e.dataTransfer.files);
                if (files.length > 0) {
                    this.handleFileUpload(files);
                }
            });
        }
    }

    /**
     * 绑定消息列表事件
     */
    attachMessageListeners() {
        const copyBtns = this.container.querySelectorAll(".copy-btn");
        copyBtns.forEach((btn) => {
            btn.addEventListener("click", async () => {
                const content = btn.dataset.content;
                try {
                    await copyToClipboard(content);
                    btn.innerHTML = `
            <svg class="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          `;
                    setTimeout(() => {
                        btn.innerHTML = `
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
            `;
                    }, 2000);
                } catch (error) {
                    console.error("复制失败:", error);
                }
            });
        });
    }

    /**
     * 发送消息
     */
    async sendMessage() {
        const messageInput = this.container.querySelector("#message-input");
        if (!messageInput) return;

        const content = messageInput.value.trim();
        if (!content) return;

        if (!this.state.apiKey) {
            appStore.setError("请先配置 API Key");
            return;
        }

        // 设置API密钥到openaiService
        openaiService.setApiKey(this.state.apiKey);

        // 清空输入框
        messageInput.value = "";
        messageInput.style.height = "auto";

        // 更新字符计数
        const charCount = this.container.querySelector("#char-count");
        if (charCount) {
            charCount.textContent = "0";
        }

        // 添加用户消息
        const userMessage = {
            id: Date.now().toString(),
            role: "user",
            content,
            timestamp: Date.now(),
        };
        appStore.addMessage(userMessage);

        // 准备消息历史（包含文件内容）
        const messages = this.prepareMessagesForAPI();

        try {
            appStore.setLoading(true);

            // 创建助手消息占位符
            const assistantMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "",
                timestamp: Date.now(),
            };
            appStore.addMessage(assistantMessage);

            this.currentStreamingMessage = assistantMessage;
            this.streamingContent = "";
            this.isStreaming = true;

            // 发送流式请求
            await openaiService.sendChatMessageStream(messages, (chunk) => {
                this.handleStreamChunk(chunk);
            });
        } catch (error) {
            console.error("发送消息失败:", error);
            appStore.setError(`发送消息失败: ${error.message}`);

            // 移除失败的助手消息
            if (this.currentStreamingMessage) {
                appStore.removeMessage(this.currentStreamingMessage.id);
            }
        } finally {
            appStore.setLoading(false);
            this.isStreaming = false;
            this.currentStreamingMessage = null;
            this.streamingContent = "";
        }
    }

    /**
     * 准备发送给API的消息
     */
    prepareMessagesForAPI() {
        const messages = [...this.state.messages];

        // 如果有上传的文件，在第一条用户消息前添加文件内容
        if (this.state.uploadedFiles.length > 0) {
            const fileContents = this.state.uploadedFiles
                .map((file) => `文件名: ${file.name}\n内容:\n${file.content}`)
                .join("\n\n---\n\n");

            const systemMessage = {
                role: "system",
                content: `用户上传了以下文件，请在回答时参考这些文件内容：\n\n${fileContents}`,
            };

            messages.unshift(systemMessage);
        }

        return messages;
    }

    /**
     * 处理流式响应块
     */
    handleStreamChunk(chunk) {
        if (!this.currentStreamingMessage) return;

        this.streamingContent += chunk;

        // 更新消息内容
        appStore.updateMessage(this.currentStreamingMessage.id, {
            content: this.streamingContent,
        });
    }

    /**
     * 滚动到底部
     */
    scrollToBottom() {
        const messagesContainer = this.container?.querySelector("#messages-container");
        if (messagesContainer) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }
    }

    /**
     * 处理文件上传
     */
    async handleFileUpload(files) {
        if (!files || files.length === 0) return;

        const uploadProgress = this.container.querySelector("#upload-progress");
        const uploadFileList = this.container.querySelector("#upload-file-list");

        if (!uploadProgress || !uploadFileList) return;

        // 显示上传进度区域
        uploadProgress.classList.remove("hidden");
        uploadFileList.innerHTML = "";

        const fileArray = Array.from(files);
        const uploadPromises = [];

        for (const file of fileArray) {
            // 创建文件项UI
            const fileItem = this.createFileUploadItem(file);
            uploadFileList.appendChild(fileItem);

            // 开始上传处理
            const uploadPromise = this.processFileUpload(file, fileItem);
            uploadPromises.push(uploadPromise);
        }

        try {
            const results = await Promise.allSettled(uploadPromises);

            // 处理上传结果
            const successfulUploads = results
                .filter((result) => result.status === "fulfilled" && result.value)
                .map((result) => result.value);

            if (successfulUploads.length > 0) {
                // 将成功上传的文件添加到store
                successfulUploads.forEach((fileData) => {
                    appStore.addFile(fileData);
                });

                // 在输入框中插入文件引用
                this.insertFileReferences(successfulUploads);
            }

            // 3秒后隐藏上传进度
            setTimeout(() => {
                uploadProgress.classList.add("hidden");
            }, 3000);
        } catch (error) {
            console.error("文件上传失败:", error);
            appStore.setError("文件上传失败: " + error.message);
        }

        // 清空文件输入
        const fileInput = this.container.querySelector("#file-input");
        if (fileInput) {
            fileInput.value = "";
        }
    }

    /**
     * 创建文件上传项UI
     */
    createFileUploadItem(file) {
        const fileItem = document.createElement("div");
        fileItem.className = "flex items-center justify-between p-2 bg-white rounded border";

        fileItem.innerHTML = `
            <div class="flex items-center space-x-2 flex-1 min-w-0">
                <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">${file.name}</p>
                    <p class="text-xs text-gray-500">${fileService.formatFileSize(file.size)}</p>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <div class="upload-status">
                    <div class="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        `;

        return fileItem;
    }

    /**
     * 处理单个文件上传
     */
    async processFileUpload(file, fileItem) {
        const statusElement = fileItem.querySelector(".upload-status");

        try {
            // 验证文件
            const validation = fileService.validateFile(file);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // 处理文件
            const fileData = await fileService.processFile(file);

            // 更新状态为成功
            statusElement.innerHTML = `
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            `;

            return fileData;
        } catch (error) {
            // 更新状态为失败
            statusElement.innerHTML = `
                <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            `;

            // 显示错误信息
            const errorElement = document.createElement("p");
            errorElement.className = "text-xs text-red-600 mt-1";
            errorElement.textContent = error.message;
            fileItem.appendChild(errorElement);

            console.error(`文件 ${file.name} 上传失败:`, error);
            return null;
        }
    }

    /**
     * 在输入框中插入文件引用
     */
    insertFileReferences(files) {
        const messageInput = this.container.querySelector("#message-input");
        if (!messageInput) return;

        const currentValue = messageInput.value;
        const fileReferences = files.map((file) => `[文件: ${file.name}]`).join(" ");

        const newValue = currentValue ? `${currentValue}\n${fileReferences}` : fileReferences;
        messageInput.value = newValue;

        // 触发input事件以更新字符计数和高度
        messageInput.dispatchEvent(new Event("input"));
        messageInput.focus();
    }

    /**
     * 取消文件上传
     */
    cancelFileUpload() {
        const uploadProgress = this.container.querySelector("#upload-progress");
        if (uploadProgress) {
            uploadProgress.classList.add("hidden");
        }

        // 清空文件输入
        const fileInput = this.container.querySelector("#file-input");
        if (fileInput) {
            fileInput.value = "";
        }
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
