/**
 * 文件处理服务
 * 处理文件上传、解析和预览功能
 */

import mammoth from "mammoth";

class FileService {
    constructor() {
        this.supportedTypes = [
            "text/plain",
            "text/markdown",
            "application/json",
            "text/csv",
            "text/html",
            "text/css",
            "text/javascript",
            "application/javascript",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        ];

        this.maxFileSize = 10 * 1024 * 1024; // 10MB
    }

    /**
     * 验证文件类型和大小
     */
    validateFile(file) {
        const errors = [];

        // 检查文件是否存在
        if (!file) {
            return {
                valid: false,
                error: "未选择文件",
                errors: ["未选择文件"]
            };
        }

        // 检查文件大小
        if (file.size === 0) {
            errors.push("文件为空");
        } else if (file.size > this.maxFileSize) {
            errors.push(`文件大小超过限制 (最大 ${this.formatFileSize(this.maxFileSize)}，当前 ${this.formatFileSize(file.size)})`);
        }

        // 检查文件类型
        const isSupported = this.supportedTypes.includes(file.type) || this.isTextFile(file.name);
        if (!isSupported) {
            const extension = file.name.substring(file.name.lastIndexOf('.'));
            errors.push(`不支持的文件类型 "${extension || file.type}"。支持的格式：文本文件、代码文件、JSON、CSV、HTML、DOCX等`);
        }

        // 检查文件名
        if (!file.name || file.name.trim() === '') {
            errors.push("文件名无效");
        }

        // 检查文件名长度
        if (file.name && file.name.length > 255) {
            errors.push("文件名过长（最大255个字符）");
        }

        const isValid = errors.length === 0;
        
        return {
            valid: isValid,
            isValid: isValid, // 保持向后兼容
            error: errors.length > 0 ? errors[0] : null,
            errors: errors,
            fileInfo: {
                name: file.name,
                size: file.size,
                type: file.type,
                sizeFormatted: this.formatFileSize(file.size)
            }
        };
    }

    /**
     * 根据文件扩展名判断是否为文本文件
     */
    isTextFile(fileName) {
        const textExtensions = [
            ".txt",
            ".md",
            ".json",
            ".csv",
            ".html",
            ".css",
            ".js",
            ".jsx",
            ".ts",
            ".tsx",
            ".py",
            ".java",
            ".cpp",
            ".c",
            ".h",
            ".xml",
            ".yml",
            ".yaml",
            ".docx",
        ];

        const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
        return textExtensions.includes(extension);
    }

    /**
     * 检查是否为 docx 文件
     */
    isDocxFile(fileName) {
        const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
        return extension === ".docx";
    }

    /**
     * 读取 docx 文件内容
     */
    async readDocxContent(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            return result.value;
        } catch (error) {
            throw new Error(`无法解析 DOCX 文件: ${error.message}`);
        }
    }

    /**
     * 读取文件内容
     */
    async readFileContent(file) {
        // 如果是 docx 文件，使用特殊处理
        if (this.isDocxFile(file.name)) {
            return await this.readDocxContent(file);
        }

        // 其他文件使用文本读取
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                resolve(event.target.result);
            };

            reader.onerror = () => {
                reject(new Error("文件读取失败"));
            };

            reader.readAsText(file);
        });
    }

    /**
     * 处理文件上传
     */
    async processFile(file, onProgress) {
        const validation = this.validateFile(file);

        if (!validation.valid) {
            throw new Error(validation.error || validation.errors.join(", "));
        }

        try {
            // 模拟上传进度
            if (onProgress) {
                onProgress(0);
                for (let i = 10; i <= 90; i += 10) {
                    await this.delay(50);
                    onProgress(i);
                }
            }

            // 读取文件内容
            let content;
            try {
                content = await this.readFileContent(file);
            } catch (readError) {
                throw new Error(`无法读取文件内容: ${readError.message}`);
            }

            // 验证内容
            if (content === null || content === undefined) {
                throw new Error("文件内容为空或无法解析");
            }

            // 检查内容长度
            if (content.length > 1000000) { // 1MB 文本内容限制
                throw new Error("文件内容过大，请选择较小的文件");
            }

            const processedFile = {
                id: this.generateId(),
                name: file.name,
                size: file.size,
                type: file.type,
                content: content,
                preview: this.generatePreview(content),
                uploadedAt: new Date().toISOString(),
                icon: this.getFileIcon(file.name)
            };

            // 完成进度
            if (onProgress) {
                onProgress(100);
            }

            return processedFile;
        } catch (error) {
            // 提供更具体的错误信息
            if (error.name === 'NotReadableError') {
                throw new Error("文件无法读取，可能已损坏或正在被其他程序使用");
            } else if (error.name === 'SecurityError') {
                throw new Error("没有权限访问该文件");
            } else if (error.message.includes('network')) {
                throw new Error("网络错误，请检查网络连接后重试");
            } else {
                throw new Error(`文件处理失败: ${error.message}`);
            }
        }
    }

    /**
     * 批量处理文件
     */
    async processFiles(files, onProgress) {
        const results = [];
        const total = files.length;

        for (let i = 0; i < files.length; i++) {
            try {
                const file = files[i];
                const processedFile = await this.processFile(file, (fileProgress) => {
                    const overallProgress = (i / total) * 100 + fileProgress / total;
                    onProgress?.(Math.round(overallProgress));
                });

                results.push({
                    success: true,
                    file: processedFile,
                });
            } catch (error) {
                results.push({
                    success: false,
                    fileName: files[i].name,
                    error: error.message,
                });
            }
        }

        return results;
    }

    /**
     * 生成文件预览
     */
    generatePreview(content, maxLength = 500) {
        if (!content) return "";

        const preview = content.length > maxLength ? content.substring(0, maxLength) + "..." : content;

        return preview;
    }

    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return "0 Bytes";

        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * 获取文件图标
     */
    getFileIcon(fileName) {
        const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));

        const iconMap = {
            ".txt": "📄",
            ".md": "📝",
            ".json": "🔧",
            ".csv": "📊",
            ".html": "🌐",
            ".css": "🎨",
            ".js": "⚡",
            ".jsx": "⚛️",
            ".ts": "🔷",
            ".tsx": "🔷",
            ".py": "🐍",
            ".java": "☕",
            ".cpp": "⚙️",
            ".c": "⚙️",
            ".docx": "📘",
        };

        return iconMap[extension] || "📄";
    }

    /**
     * 导出文件内容
     */
    exportFile(content, fileName, mimeType = "text/plain") {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    }
}

export const fileService = new FileService();
