/**
 * 文件面板组件
 * 管理文件上传和预览
 */

import { appStore } from "../stores/appStore.js";
import { fileService } from "../services/fileService.js";
import { formatFileSize, formatTime } from "../utils/helpers.js";

export class FilePanel {
    constructor() {
        this.state = appStore.getState();
        this.unsubscribe = appStore.subscribe((newState) => {
            this.state = newState;
            this.updateContent();
        });

        this.dragCounter = 0;
        this.isUploading = false;
    }

    /**
     * 渲染文件面板
     */
    render(container) {
        this.container = container;

        container.innerHTML = `
      <div class="h-full bg-white flex flex-col">
        <!-- 头部 -->
        <div class="border-b border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">文件管理</h2>
              <p class="text-gray-600 mt-1">上传和管理您的文档文件</p>
            </div>
            <div class="text-sm text-gray-500">
              ${this.state.uploadedFiles.length} 个文件
            </div>
          </div>
        </div>

        <!-- 上传区域 -->
        <div class="p-6 border-b border-gray-200">
          <div 
            id="drop-zone" 
            class="drag-area ${this.isUploading ? "opacity-50 pointer-events-none" : ""}"
          >
            <div class="text-center">
              <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              
              ${
                  this.isUploading
                      ? `
                <div class="mb-4">
                  <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto"></div>
                </div>
                <p class="text-lg font-medium text-gray-700 mb-2">正在上传文件...</p>
                <div id="upload-progress" class="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div class="bg-primary-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
                <p class="text-sm text-gray-500" id="upload-status">准备中...</p>
              `
                      : `
                <p class="text-lg font-medium text-gray-700 mb-2">拖拽文件到此处</p>
                <p class="text-gray-500 mb-4">或者</p>
                <button 
                  id="select-files-btn" 
                  class="btn-primary"
                >
                  选择文件
                </button>
                <input 
                  type="file" 
                  id="file-input" 
                  multiple 
                  accept=".txt,.md,.json,.csv,.html,.css,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.h,.xml,.yml,.yaml"
                  class="hidden"
                />
                <p class="text-xs text-gray-500 mt-3">
                  支持: TXT, MD, JSON, CSV, HTML, CSS, JS, TS, PY 等文本文件 (最大 10MB)
                </p>
              `
              }
            </div>
          </div>
        </div>

        <!-- 文件列表 -->
        <div class="flex-1 overflow-hidden">
          <div class="h-full overflow-y-auto scrollbar-thin">
            <div id="file-list" class="p-6">
              ${this.renderFileList()}
            </div>
          </div>
        </div>
      </div>
    `;

        this.attachEventListeners();
    }

    /**
     * 渲染文件列表
     */
    renderFileList() {
        if (this.state.uploadedFiles.length === 0) {
            return `
        <div class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">暂无文件</h3>
          <p class="text-gray-500">上传一些文件开始使用吧</p>
        </div>
      `;
        }

        return `
      <div class="space-y-4">
        ${this.state.uploadedFiles
            .map(
                (file) => `
          <div class="file-item bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="flex items-start space-x-4">
              <!-- 文件图标 -->
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                  ${fileService.getFileIcon(file.name)}
                </div>
              </div>
              
              <!-- 文件信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="text-sm font-medium text-gray-900 truncate">${file.name}</h4>
                  <div class="flex items-center space-x-2">
                    <button 
                      class="file-action-btn text-gray-400 hover:text-primary-600 transition-colors"
                      data-action="preview"
                      data-file-id="${file.id}"
                      title="预览"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                    <button 
                      class="file-action-btn text-gray-400 hover:text-green-600 transition-colors"
                      data-action="download"
                      data-file-id="${file.id}"
                      title="下载"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-4-4m4 4l4-4m5-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </button>
                    <button 
                      class="file-action-btn text-gray-400 hover:text-red-600 transition-colors"
                      data-action="delete"
                      data-file-id="${file.id}"
                      title="删除"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div class="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                  <span>${formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>${formatTime(file.uploadedAt)}</span>
                </div>
                
                <!-- 文件预览 -->
                <div class="bg-gray-50 rounded p-3 text-xs text-gray-600 font-mono">
                  <div class="line-clamp-3">${file.preview}</div>
                </div>
              </div>
            </div>
          </div>
        `
            )
            .join("")}
      </div>
    `;
    }

    /**
     * 更新内容
     */
    updateContent() {
        if (!this.container) return;

        // 更新文件计数
        const fileCount = this.container.querySelector(".text-sm.text-gray-500");
        if (fileCount) {
            fileCount.textContent = `${this.state.uploadedFiles.length} 个文件`;
        }

        // 更新文件列表
        const fileList = this.container.querySelector("#file-list");
        if (fileList) {
            fileList.innerHTML = this.renderFileList();
            this.attachFileListeners();
        }
    }

    /**
     * 绑定事件监听器
     */
    attachEventListeners() {
        const dropZone = this.container.querySelector("#drop-zone");
        const fileInput = this.container.querySelector("#file-input");
        const selectFilesBtn = this.container.querySelector("#select-files-btn");

        // 文件选择按钮
        if (selectFilesBtn && fileInput) {
            selectFilesBtn.addEventListener("click", () => {
                fileInput.click();
            });
        }

        // 文件输入变化
        if (fileInput) {
            fileInput.addEventListener("change", (e) => {
                this.handleFiles(Array.from(e.target.files));
            });
        }

        // 拖拽事件
        if (dropZone) {
            dropZone.addEventListener("dragenter", (e) => {
                e.preventDefault();
                this.dragCounter++;
                dropZone.classList.add("drag-over");
            });

            dropZone.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            dropZone.addEventListener("dragleave", (e) => {
                e.preventDefault();
                this.dragCounter--;
                if (this.dragCounter === 0) {
                    dropZone.classList.remove("drag-over");
                }
            });

            dropZone.addEventListener("drop", (e) => {
                e.preventDefault();
                this.dragCounter = 0;
                dropZone.classList.remove("drag-over");

                const files = Array.from(e.dataTransfer.files);
                this.handleFiles(files);
            });
        }

        this.attachFileListeners();
    }

    /**
     * 绑定文件列表事件
     */
    attachFileListeners() {
        const fileActionBtns = this.container.querySelectorAll(".file-action-btn");

        fileActionBtns.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const fileId = btn.dataset.fileId;

                switch (action) {
                    case "preview":
                        this.previewFile(fileId);
                        break;
                    case "download":
                        this.downloadFile(fileId);
                        break;
                    case "delete":
                        this.deleteFile(fileId);
                        break;
                }
            });
        });
    }

    /**
     * 处理文件上传
     */
    async handleFiles(files) {
        if (files.length === 0) return;

        this.isUploading = true;
        this.updateUploadUI();

        try {
            const results = await fileService.processFiles(files, (progress) => {
                this.updateProgress(progress);
            });

            // 处理结果
            const successFiles = results.filter((r) => r.success);
            const failedFiles = results.filter((r) => !r.success);

            // 添加成功的文件
            successFiles.forEach((result) => {
                appStore.addFile(result.file);
            });

            // 显示错误信息
            if (failedFiles.length > 0) {
                const errorMessages = failedFiles.map((f) => `${f.fileName}: ${f.error}`);
                appStore.setError(`部分文件上传失败:\n${errorMessages.join("\n")}`);
            }

            // 显示成功信息
            if (successFiles.length > 0) {
                this.showSuccessMessage(`成功上传 ${successFiles.length} 个文件`);
            }
        } catch (error) {
            appStore.setError(`文件上传失败: ${error.message}`);
        } finally {
            this.isUploading = false;
            this.updateUploadUI();

            // 重置文件输入
            const fileInput = this.container.querySelector("#file-input");
            if (fileInput) {
                fileInput.value = "";
            }
        }
    }

    /**
     * 更新上传UI
     */
    updateUploadUI() {
        const dropZone = this.container.querySelector("#drop-zone");
        if (dropZone) {
            if (this.isUploading) {
                dropZone.classList.add("opacity-50", "pointer-events-none");
            } else {
                dropZone.classList.remove("opacity-50", "pointer-events-none");
            }
        }
    }

    /**
     * 更新上传进度
     */
    updateProgress(progress) {
        const progressBar = this.container.querySelector("#upload-progress .bg-primary-500");
        const statusText = this.container.querySelector("#upload-status");

        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        if (statusText) {
            statusText.textContent = `上传进度: ${progress}%`;
        }
    }

    /**
     * 预览文件
     */
    previewFile(fileId) {
        const file = this.state.uploadedFiles.find((f) => f.id === fileId);
        if (!file) return;

        // 创建预览模态框
        const modal = document.createElement("div");
        modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50";
        modal.innerHTML = `
      <div class="bg-white rounded-lg max-w-4xl max-h-[80vh] w-full mx-4 flex flex-col">
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">${file.name}</h3>
          <button id="close-preview" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="flex-1 overflow-auto p-4">
          <pre class="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded">${file.content}</pre>
        </div>
      </div>
    `;

        document.body.appendChild(modal);

        // 绑定关闭事件
        const closeBtn = modal.querySelector("#close-preview");
        const closeModal = () => {
            document.body.removeChild(modal);
        };

        closeBtn.addEventListener("click", closeModal);
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener(
            "keydown",
            (e) => {
                if (e.key === "Escape") closeModal();
            },
            { once: true }
        );
    }

    /**
     * 下载文件
     */
    downloadFile(fileId) {
        const file = this.state.uploadedFiles.find((f) => f.id === fileId);
        if (!file) return;

        fileService.exportFile(file.content, file.name, file.type);
    }

    /**
     * 删除文件
     */
    deleteFile(fileId) {
        const file = this.state.uploadedFiles.find((f) => f.id === fileId);
        if (!file) return;

        if (confirm(`确定要删除文件 "${file.name}" 吗？`)) {
            appStore.removeFile(fileId);
        }
    }

    /**
     * 显示成功消息
     */
    showSuccessMessage(message) {
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
