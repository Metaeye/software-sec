/**
 * 错误提示组件
 * 显示全局错误消息
 */

import { appStore } from "../stores/appStore.js";

export class ErrorToast {
    constructor() {
        this.state = appStore.getState();
        this.unsubscribe = appStore.subscribe((newState) => {
            this.state = newState;
            this.updateVisibility();
        });
    }

    /**
     * 渲染错误提示
     */
    render(container) {
        this.container = container;

        container.innerHTML = `
      <div 
        id="error-toast-content" 
        class="fixed top-4 right-4 z-50 transform transition-all duration-300 ${
            this.state.error ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }"
      >
        <div class="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-sm">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <svg class="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="flex-1">
              <h4 class="font-medium">错误</h4>
              <p class="text-sm mt-1 opacity-90" id="error-message">
                ${this.state.error || ""}
              </p>
            </div>
            <button 
              id="close-error-toast" 
              class="flex-shrink-0 ml-2 text-white hover:text-gray-200 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

        this.attachEventListeners();
    }

    /**
     * 更新显示状态
     */
    updateVisibility() {
        if (!this.container) return;

        const toastContent = this.container.querySelector("#error-toast-content");
        const errorMessage = this.container.querySelector("#error-message");

        if (toastContent && errorMessage) {
            if (this.state.error) {
                errorMessage.textContent = this.state.error;
                toastContent.className = toastContent.className.replace(
                    "translate-x-full opacity-0",
                    "translate-x-0 opacity-100"
                );
            } else {
                toastContent.className = toastContent.className.replace(
                    "translate-x-0 opacity-100",
                    "translate-x-full opacity-0"
                );
            }
        }
    }

    /**
     * 绑定事件监听器
     */
    attachEventListeners() {
        const closeBtn = this.container.querySelector("#close-error-toast");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                appStore.setError(null);
            });
        }

        // 点击外部区域关闭
        const toastContent = this.container.querySelector("#error-toast-content");
        if (toastContent) {
            document.addEventListener("click", (e) => {
                if (this.state.error && !toastContent.contains(e.target)) {
                    appStore.setError(null);
                }
            });
        }

        // ESC键关闭
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.state.error) {
                appStore.setError(null);
            }
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
