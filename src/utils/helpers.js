/**
 * 工具函数集合
 */

/**
 * 格式化时间戳
 */
export function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // 小于1分钟
    if (diff < 60000) {
        return "刚刚";
    }

    // 小于1小时
    if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`;
    }

    // 小于24小时
    if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`;
    }

    // 小于7天
    if (diff < 604800000) {
        return `${Math.floor(diff / 86400000)}天前`;
    }

    // 超过7天显示具体日期
    return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * 防抖函数
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 */
export function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * 深拷贝对象
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== "object") {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
        return obj.map((item) => deepClone(item));
    }

    if (typeof obj === "object") {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * 生成随机ID
 */
export function generateId(length = 8) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * 验证URL格式
 */
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * 转义HTML字符
 */
export function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 解析HTML字符
 */
export function unescapeHtml(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // 降级方案
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand("copy");
            return true;
        } catch (err) {
            return false;
        } finally {
            document.body.removeChild(textArea);
        }
    }
}

/**
 * 下载文件
 */
export function downloadFile(content, filename, mimeType = "text/plain") {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename) {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

/**
 * 检查是否为移动设备
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 滚动到元素
 */
export function scrollToElement(element, behavior = "smooth") {
    if (element) {
        element.scrollIntoView({ behavior, block: "nearest" });
    }
}

/**
 * 创建延迟Promise
 */
export function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 安全的JSON解析
 */
export function safeJsonParse(str, defaultValue = null) {
    try {
        return JSON.parse(str);
    } catch {
        return defaultValue;
    }
}

/**
 * 检查对象是否为空
 */
export function isEmpty(obj) {
    if (obj == null) return true;
    if (Array.isArray(obj) || typeof obj === "string") return obj.length === 0;
    return Object.keys(obj).length === 0;
}

/**
 * 过滤Message对象content字段中的系统指令
 * 专门用于识别并移除符合 {"role":"system","content":"..."} 格式的JSON系统指令
 * 
 * @param {string} text - 输入的文本内容，可能包含系统指令和用户内容的混合字符串
 * @returns {object} 返回包含过滤结果的对象
 */
export function filterSystemPrompts(text) {
    // 输入验证
    if (typeof text !== 'string') {
        return {
            success: false,
            cleanedContent: '',
            originalContent: text,
            filteredCount: 0,
            errors: ['输入必须是字符串类型']
        };
    }

    // 处理空输入
    if (!text.trim()) {
        return {
            success: true,
            cleanedContent: text,
            originalContent: text,
            filteredCount: 0,
            errors: []
        };
    }

    try {
        // 使用更强大的方法来检测系统指令JSON
        // 首先用宽松的正则表达式找到可能的JSON对象，然后尝试解析
        const possibleJsonRegex = /\{[^{}]*"role"[^{}]*"system"[^{}]*\}/g;
        
        let filteredCount = 0;
        let cleanedContent = text;
        const matches = [];

        // 查找所有可能的JSON对象
        let match;
        while ((match = possibleJsonRegex.exec(text)) !== null) {
            const jsonStr = match[0];
            
            // 尝试解析JSON并检查是否为系统指令
            try {
                // 先尝试直接解析
                let parsed;
                try {
                    parsed = JSON.parse(jsonStr);
                } catch (e) {
                    // 如果解析失败，尝试修复常见的JSON格式问题
                    const fixedJson = jsonStr
                        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":') // 添加缺失的引号
                        .replace(/:\s*([^",\{\}\[\]]+)(?=\s*[,\}])/g, ':"$1"'); // 为值添加引号
                    parsed = JSON.parse(fixedJson);
                }
                
                // 检查是否为系统指令
                if (parsed && typeof parsed === 'object' && parsed.role === 'system') {
                    matches.push({
                        content: jsonStr,
                        start: match.index,
                        end: match.index + jsonStr.length
                    });
                    filteredCount++;
                }
            } catch (parseError) {
                // 如果JSON解析失败，使用更宽松的字符串匹配
                if (jsonStr.includes('"role"') && jsonStr.includes('"system"') && jsonStr.includes('"content"')) {
                    matches.push({
                        content: jsonStr,
                        start: match.index,
                        end: match.index + jsonStr.length
                    });
                    filteredCount++;
                }
            }
        }

        // 从后往前移除匹配项，避免索引偏移问题
        matches.reverse().forEach(matchInfo => {
            cleanedContent = cleanedContent.slice(0, matchInfo.start) + 
                           cleanedContent.slice(matchInfo.end);
        });

        // 清理多余的空白字符和换行符
        cleanedContent = cleanedContent
            .replace(/\n\s*\n/g, '\n') // 移除多余的空行
            .replace(/^\s+|\s+$/g, '') // 移除首尾空白
            .replace(/\n\s*$/g, ''); // 移除末尾的换行和空白

        return {
            success: true,
            cleanedContent,
            originalContent: text,
            filteredCount,
            errors: []
        };

    } catch (error) {
        return {
            success: false,
            cleanedContent: text,
            originalContent: text,
            filteredCount: 0,
            errors: [`处理过程中发生错误: ${error.message}`]
        };
    }
}

/**
 * 高级系统指令过滤器
 * 支持更复杂的场景，包括嵌套JSON、多种格式变体等
 * 
 * @param {string} text - 输入文本
 * @param {object} options - 配置选项
 * @returns {object} 过滤结果
 */
export function advancedFilterSystemPrompts(text, options = {}) {
    const {
        preserveWhitespace = false, // 是否保留原始空白字符
        strictMode = false, // 严格模式，只匹配标准JSON格式
        logMatches = false // 是否记录匹配的内容
    } = options;

    if (typeof text !== 'string') {
        return {
            success: false,
            cleanedContent: '',
            originalContent: text,
            filteredCount: 0,
            matches: [],
            errors: ['输入必须是字符串类型']
        };
    }

    if (!text.trim()) {
        return {
            success: true,
            cleanedContent: text,
            originalContent: text,
            filteredCount: 0,
            matches: [],
            errors: []
        };
    }

    try {
        let cleanedContent = text;
        let filteredCount = 0;
        const matches = [];
        const errors = [];

        // 基础正则表达式
        let systemPromptRegex;
        
        if (strictMode) {
            // 严格模式：精确匹配标准JSON格式
            systemPromptRegex = /\{"role":"system","content":"[^"]*(?:\\.[^"]*)*"\}/g;
        } else {
            // 宽松模式：支持各种空白字符和引号变体
            systemPromptRegex = /\{\s*["']?role["']?\s*:\s*["']system["']\s*,\s*["']?content["']?\s*:\s*["'][^"']*(?:\\.[^"']*)*["']\s*\}/g;
        }

        // 查找并处理匹配项
        let match;
        const matchInfos = [];
        
        while ((match = systemPromptRegex.exec(text)) !== null) {
            const matchInfo = {
                content: match[0],
                start: match.index,
                end: match.index + match[0].length,
                line: text.substring(0, match.index).split('\n').length
            };
            
            matchInfos.push(matchInfo);
            
            if (logMatches) {
                matches.push({
                    content: matchInfo.content,
                    position: matchInfo.start,
                    line: matchInfo.line
                });
            }
            
            filteredCount++;
        }

        // 验证匹配的JSON格式
        matchInfos.forEach(matchInfo => {
            try {
                JSON.parse(matchInfo.content);
            } catch (e) {
                errors.push(`第${matchInfo.line}行发现格式错误的JSON: ${e.message}`);
            }
        });

        // 从后往前移除匹配项
        matchInfos.reverse().forEach(matchInfo => {
            cleanedContent = cleanedContent.slice(0, matchInfo.start) + 
                           cleanedContent.slice(matchInfo.end);
        });

        // 根据选项处理空白字符
        if (!preserveWhitespace && cleanedContent.trim()) {
            cleanedContent = cleanedContent
                .replace(/\n\s*\n/g, '\n')
                .replace(/^\s+|\s+$/g, '')
                .replace(/\n\s*$/g, '');
        }

        return {
            success: true,
            cleanedContent,
            originalContent: text,
            filteredCount,
            matches,
            errors
        };

    } catch (error) {
        return {
            success: false,
            cleanedContent: text,
            originalContent: text,
            filteredCount: 0,
            matches: [],
            errors: [`处理过程中发生错误: ${error.message}`]
        };
    }
}
