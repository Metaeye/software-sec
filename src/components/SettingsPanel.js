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
      <div class="h-full bg-white flex flex-col">
        <!-- Header -->
        <div class="border-b border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Settings</h2>
              <p class="text-gray-600 mt-1">Configure your API key and preferences</p>
            </div>
            <div class="text-sm text-gray-500">
              ${this.state.apiKey ? "API Connected" : "API Not Configured"}
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto">
          <div class="max-w-2xl mx-auto p-6">

          <!-- API configuration -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.243-6.243A6 6 0 0121 9z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">OpenAI API Configuration</h3>
                <p class="text-sm text-gray-600">Configure your OpenAI API key to get started</p>
              </div>
            </div>

            <form id="api-key-form" class="space-y-4">
              <div>
                <label for="api-key" class="block text-sm font-medium text-gray-700 mb-2">
                  API Key
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
                  Your API key will be securely stored in your local browser
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
                    <span>Validating...</span>
                  `
                          : `
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Save and Verify</span>
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
                    <span>Test Connection</span>
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
                  ${this.state.apiKey ? "API Key Configured" : "API Key Not Configured"}
                </span>
              </div>
            </form>
          </div>

          <!-- Model configuration -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Model Settings</h3>
                <p class="text-sm text-gray-600">Choose your preferred AI model</p>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label for="model-select" class="block text-sm font-medium text-gray-700 mb-2">
                  Default Model
                </label>
                <select id="model-select" class="input-field">
                  <option value="gpt-3.5-turbo" ${this.state.currentModel === "gpt-3.5-turbo" ? "selected" : ""}>
                    GPT-3.5 Turbo (Recommended)
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

          <!-- Security settings -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Security Settings</h3>
                <p class="text-sm text-gray-600">Configure content filtering and security</p>
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div class="flex-1">
                  <label for="enable-filter" class="block text-sm font-medium text-gray-900 mb-1">
                    Enable Content Filter
                  </label>
                  <p class="text-xs text-gray-600">
                    When enabled, malicious system instructions and phishing attempts in uploaded files will be automatically filtered. 
                    When disabled, all content is sent to AI (useful for testing attack scenarios).
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="enable-filter"
                    class="sr-only peer"
                    ${this.state.enableContentFilter ? "checked" : ""}
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              ${!this.state.enableContentFilter ? `
                <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div class="flex items-start space-x-2">
                    <svg class="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <div class="text-sm text-yellow-800">
                      <p class="font-medium mb-1">Content Filter Disabled</p>
                      <p>Malicious instructions in uploaded files will NOT be filtered. AI may be deceived by system instructions or phishing attempts. Use this mode only for testing attack scenarios.</p>
                    </div>
                  </div>
                </div>
              ` : `
                <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div class="flex items-start space-x-2">
                    <svg class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                    <div class="text-sm text-green-800">
                      <p class="font-medium mb-1">Content Filter Enabled</p>
                      <p>System instructions and phishing attempts in uploaded files will be automatically filtered. AI will only see legitimate document content.</p>
                    </div>
                  </div>
                </div>
              `}
            </div>
          </div>

          <!-- Data management -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Data Management</h3>
                <p class="text-sm text-gray-600">Manage your chat history and files</p>
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
                <span>Clear All Chat History</span>
              </button>

              <button
                id="clear-files"
                class="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                <span>Clear All Uploaded Files</span>
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    `;

        this.attachEventListeners();
    }

    /**
     * Update content
     */
    updateContent() {
        if (!this.container) return;

        // Update API key input
        const apiKeyInput = this.container.querySelector("#api-key");
        if (apiKeyInput && apiKeyInput.value !== this.state.apiKey) {
            apiKeyInput.value = this.state.apiKey;
        }

        // Update model selection
        const modelSelect = this.container.querySelector("#model-select");
        if (modelSelect) {
            modelSelect.value = this.state.currentModel;
        }

        // Update content filter toggle
        const enableFilter = this.container.querySelector("#enable-filter");
        if (enableFilter && enableFilter.checked !== this.state.enableContentFilter) {
            enableFilter.checked = this.state.enableContentFilter;
        }

        // Update status message (find the security settings section and update it)
        // Look for the status message div that comes after the toggle switch
        const enableFilterContainer = this.container.querySelector('#enable-filter')?.closest('.flex.items-center.justify-between');
        if (enableFilterContainer) {
            // Find the next sibling that contains the status message
            let statusDiv = enableFilterContainer.nextElementSibling;
            while (statusDiv && !statusDiv.classList.contains('p-3')) {
                statusDiv = statusDiv.nextElementSibling;
            }
            if (statusDiv) {
                if (!this.state.enableContentFilter) {
                    statusDiv.className = 'p-3 bg-yellow-50 border border-yellow-200 rounded-lg';
                    statusDiv.innerHTML = `
                      <div class="flex items-start space-x-2">
                        <svg class="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        <div class="text-sm text-yellow-800">
                          <p class="font-medium mb-1">Content Filter Disabled</p>
                          <p>Malicious instructions in uploaded files will NOT be filtered. AI may be deceived by system instructions or phishing attempts. Use this mode only for testing attack scenarios.</p>
                        </div>
                      </div>
                    `;
                } else {
                    statusDiv.className = 'p-3 bg-green-50 border border-green-200 rounded-lg';
                    statusDiv.innerHTML = `
                      <div class="flex items-start space-x-2">
                        <svg class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                        <div class="text-sm text-green-800">
                          <p class="font-medium mb-1">Content Filter Enabled</p>
                          <p>System instructions and phishing attempts in uploaded files will be automatically filtered. AI will only see legitimate document content.</p>
                        </div>
                      </div>
                    `;
                }
            }
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // API key form submission
        const apiKeyForm = this.container.querySelector("#api-key-form");
        if (apiKeyForm) {
            apiKeyForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                await this.handleApiKeySubmit();
            });
        }

        // Toggle API key visibility
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

        // Test API connection
        const testApiKey = this.container.querySelector("#test-api-key");
        if (testApiKey) {
            testApiKey.addEventListener("click", async () => {
                await this.testApiConnection();
            });
        }

        // Model selection
        const modelSelect = this.container.querySelector("#model-select");
        if (modelSelect) {
            modelSelect.addEventListener("change", (e) => {
                appStore.setState({ currentModel: e.target.value });
            });
        }

        // Clear chat history
        const clearMessages = this.container.querySelector("#clear-messages");
        if (clearMessages) {
            clearMessages.addEventListener("click", () => {
                if (confirm("Are you sure you want to clear all chat history? This action cannot be undone.")) {
                    appStore.clearMessages();
                }
            });
        }

        // Clear files
        const clearFiles = this.container.querySelector("#clear-files");
        if (clearFiles) {
            clearFiles.addEventListener("click", () => {
                if (confirm("Are you sure you want to clear all uploaded files? This action cannot be undone.")) {
                    appStore.setState({ uploadedFiles: [] });
                }
            });
        }

        // Content filter toggle
        const enableFilter = this.container.querySelector("#enable-filter");
        if (enableFilter) {
            enableFilter.addEventListener("change", (e) => {
                appStore.setEnableContentFilter(e.target.checked);
            });
        }
    }

    /**
     * Handle API key submission
     */
    async handleApiKeySubmit() {
        const apiKeyInput = this.container.querySelector("#api-key");
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            appStore.setError("Please enter API key");
            return;
        }

        if (!apiKey.startsWith("sk-")) {
            appStore.setError("API key format is incorrect, should start with sk-");
            return;
        }

        this.isValidating = true;
        this.updateSaveButton();

        try {
            // Validate API key
            const isValid = await openaiService.validateApiKey(apiKey);

            if (isValid) {
                appStore.setApiKey(apiKey);
                openaiService.setApiKey(apiKey);
                appStore.setError(null);

                // Show success message
                this.showSuccessMessage("API key verification successful!");
            } else {
                appStore.setError("API key verification failed, please check if the key is correct");
            }
        } catch (error) {
            appStore.setError(`API key verification failed: ${error.message}`);
        } finally {
            this.isValidating = false;
            this.updateSaveButton();
        }
    }

    /**
     * Test API connection
     */
    async testApiConnection() {
        if (!this.state.apiKey) {
            appStore.setError("Please configure API key first");
            return;
        }

        try {
            appStore.setLoading(true);

            const response = await openaiService.sendMessage([{ role: "user", content: "Hello" }], { maxTokens: 5 });

            if (response && response.choices && response.choices.length > 0) {
                this.showSuccessMessage("API connection test successful!");
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            appStore.setError(`API connection test failed: ${error.message}`);
        } finally {
            appStore.setLoading(false);
        }
    }

    /**
     * Update save button status
     */
    updateSaveButton() {
        const saveBtn = this.container.querySelector("#save-api-key");
        if (saveBtn) {
            saveBtn.disabled = this.isValidating;
            saveBtn.innerHTML = this.isValidating
                ? `
        <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        <span>Validating...</span>
      `
                : `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Save and Verify</span>
      `;
        }
    }

    /**
     * Show success message
     */
    showSuccessMessage(message) {
        // Create temporary success toast
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
     * Destroy component
     */
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}
