/**
 * 设置面板组件
 * 管理API密钥和其他配置
 */

import { appStore } from "../stores/appStore.js";
import { openaiService } from "../services/openaiService.js";

export class SettingsPanel {
    constructor() {
        this.state = appStore.getState();
        this.unsubscribe = appStore.subscribe((newState) => {
            this.state = newState;
            this.updateContent();
        });

        this.isValidating = false;
    }

    /**
     * 渲染设置面板
     */
    render(container) {
        this.container = container;

        container.innerHTML = `
      <div class="h-full bg-white">
        <div class="max-w-2xl mx-auto p-6">
          <!-- 页面标题 -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">设置</h2>
            <p class="text-gray-600">配置您的API密钥和偏好设置</p>
          </div>

          <!-- API配置 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.243-6.243A6 6 0 0121 9z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">OpenAI API 配置</h3>
                <p class="text-sm text-gray-600">配置您的OpenAI API密钥以开始使用</p>
              </div>
            </div>

            <form id="api-key-form" class="space-y-4">
              <div>
                <label for="api-key" class="block text-sm font-medium text-gray-700 mb-2">
                  API 密钥
                </label>
                <div class="relative">
                  <input
                    type="password"
                    id="api-key"
                    name="apiKey"
                    class="input-field pr-12"
                    placeholder="sk-..."
                    value="${this.state.apiKey}"
                  />
                  <button
                    type="button"
                    id="toggle-api-key"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  您的API密钥将安全地存储在本地浏览器中
                </p>
              </div>

              <div class="flex items-center space-x-3">
                <button
                  type="submit"
                  id="save-api-key"
                  class="btn-primary flex items-center space-x-2"
                  ${this.isValidating ? "disabled" : ""}
                >
                  ${
                      this.isValidating
                          ? `
                    <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>验证中...</span>
                  `
                          : `
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>保存并验证</span>
                  `
                  }
                </button>

                ${
                    this.state.apiKey
                        ? `
                  <button
                    type="button"
                    id="test-api-key"
                    class="btn-secondary flex items-center space-x-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>测试连接</span>
                  </button>
                `
                        : ""
                }
              </div>

              <!-- API状态指示器 -->
              <div class="flex items-center space-x-2 p-3 rounded-lg ${
                  this.state.apiKey ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"
              }">
                <div class="w-2 h-2 rounded-full ${this.state.apiKey ? "bg-green-500" : "bg-yellow-500"}"></div>
                <span class="text-sm ${this.state.apiKey ? "text-green-700" : "text-yellow-700"}">
                  ${this.state.apiKey ? "API密钥已配置" : "API密钥未配置"}
                </span>
              </div>
            </form>
          </div>

          <!-- 模型配置 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">模型设置</h3>
                <p class="text-sm text-gray-600">选择您偏好的AI模型</p>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label for="model-select" class="block text-sm font-medium text-gray-700 mb-2">
                  默认模型
                </label>
                <select id="model-select" class="input-field">
                  <option value="gpt-3.5-turbo" ${this.state.currentModel === "gpt-3.5-turbo" ? "selected" : ""}>
                    GPT-3.5 Turbo (推荐)
                  </option>
                  <option value="gpt-4" ${this.state.currentModel === "gpt-4" ? "selected" : ""}>
                    GPT-4
                  </option>
                  <option value="gpt-4-turbo-preview" ${
                      this.state.currentModel === "gpt-4-turbo-preview" ? "selected" : ""
                  }>
                    GPT-4 Turbo
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- 数据管理 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">数据管理</h3>
                <p class="text-sm text-gray-600">管理您的聊天记录和文件</p>
              </div>
            </div>

            <div class="space-y-3">
              <button
                id="clear-messages"
                class="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                <span>清除所有聊天记录</span>
              </button>

              <button
                id="clear-files"
                class="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                <span>清除所有上传文件</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

        this.attachEventListeners();
    }

    /**
     * 更新内容
     */
    updateContent() {
        if (!this.container) return;

        // 更新API密钥输入框
        const apiKeyInput = this.container.querySelector("#api-key");
        if (apiKeyInput && apiKeyInput.value !== this.state.apiKey) {
            apiKeyInput.value = this.state.apiKey;
        }

        // 更新模型选择
        const modelSelect = this.container.querySelector("#model-select");
        if (modelSelect) {
            modelSelect.value = this.state.currentModel;
        }
    }

    /**
     * 绑定事件监听器
     */
    attachEventListeners() {
        // API密钥表单提交
        const apiKeyForm = this.container.querySelector("#api-key-form");
        if (apiKeyForm) {
            apiKeyForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                await this.handleApiKeySubmit();
            });
        }

        // 切换API密钥显示/隐藏
        const toggleApiKey = this.container.querySelector("#toggle-api-key");
        const apiKeyInput = this.container.querySelector("#api-key");
        if (toggleApiKey && apiKeyInput) {
            toggleApiKey.addEventListener("click", () => {
                const isPassword = apiKeyInput.type === "password";
                apiKeyInput.type = isPassword ? "text" : "password";

                const icon = toggleApiKey.querySelector("svg");
                if (isPassword) {
                    icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
          `;
                } else {
                    icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          `;
                }
            });
        }

        // 测试API连接
        const testApiKey = this.container.querySelector("#test-api-key");
        if (testApiKey) {
            testApiKey.addEventListener("click", async () => {
                await this.testApiConnection();
            });
        }

        // 模型选择
        const modelSelect = this.container.querySelector("#model-select");
        if (modelSelect) {
            modelSelect.addEventListener("change", (e) => {
                appStore.setState({ currentModel: e.target.value });
            });
        }

        // 清除聊天记录
        const clearMessages = this.container.querySelector("#clear-messages");
        if (clearMessages) {
            clearMessages.addEventListener("click", () => {
                if (confirm("确定要清除所有聊天记录吗？此操作不可撤销。")) {
                    appStore.clearMessages();
                }
            });
        }

        // 清除文件
        const clearFiles = this.container.querySelector("#clear-files");
        if (clearFiles) {
            clearFiles.addEventListener("click", () => {
                if (confirm("确定要清除所有上传的文件吗？此操作不可撤销。")) {
                    appStore.setState({ uploadedFiles: [] });
                }
            });
        }
    }

    /**
     * 处理API密钥提交
     */
    async handleApiKeySubmit() {
        const apiKeyInput = this.container.querySelector("#api-key");
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            appStore.setError("请输入API密钥");
            return;
        }

        if (!apiKey.startsWith("sk-")) {
            appStore.setError("API密钥格式不正确，应以 sk- 开头");
            return;
        }

        this.isValidating = true;
        this.updateSaveButton();

        try {
            // 验证API密钥
            const isValid = await openaiService.validateApiKey(apiKey);

            if (isValid) {
                appStore.setApiKey(apiKey);
                openaiService.setApiKey(apiKey);
                appStore.setError(null);

                // 显示成功消息
                this.showSuccessMessage("API密钥验证成功！");
            } else {
                appStore.setError("API密钥验证失败，请检查密钥是否正确");
            }
        } catch (error) {
            appStore.setError(`API密钥验证失败: ${error.message}`);
        } finally {
            this.isValidating = false;
            this.updateSaveButton();
        }
    }

    /**
     * 测试API连接
     */
    async testApiConnection() {
        if (!this.state.apiKey) {
            appStore.setError("请先配置API密钥");
            return;
        }

        try {
            appStore.setLoading(true);

            const response = await openaiService.sendMessage([{ role: "user", content: "Hello" }], { maxTokens: 5 });

            if (response) {
                this.showSuccessMessage("API连接测试成功！");
            }
        } catch (error) {
            appStore.setError(`API连接测试失败: ${error.message}`);
        } finally {
            appStore.setLoading(false);
        }
    }

    /**
     * 更新保存按钮状态
     */
    updateSaveButton() {
        const saveBtn = this.container.querySelector("#save-api-key");
        if (saveBtn) {
            saveBtn.disabled = this.isValidating;
            saveBtn.innerHTML = this.isValidating
                ? `
        <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        <span>验证中...</span>
      `
                : `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>保存并验证</span>
      `;
        }
    }

    /**
     * 显示成功消息
     */
    showSuccessMessage(message) {
        // 创建临时成功提示
        const successToast = document.createElement("div");
        successToast.className =
            "fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300";
        successToast.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>${message}</span>
      </div>
    `;

        document.body.appendChild(successToast);

        setTimeout(() => {
            successToast.remove();
        }, 3000);
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
