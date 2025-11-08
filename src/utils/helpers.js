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
 * 检测并解码base64字符串
 * @param {string} base64Str - base64编码的字符串
 * @returns {string|null} 解码后的字符串，如果解码失败返回null
 */
function decodeBase64(base64Str) {
    try {
        const cleaned = base64Str.trim();
        const decoded = atob(cleaned);
        // 检查解码后的内容是否为可打印字符
        if (/^[\x20-\x7E\s]*$/.test(decoded)) {
            return decoded;
        }
        return null;
    } catch (e) {
        return null;
    }
}

/**
 * 检测是否为钓鱼指令
 * @param {string} text - 待检测的文本
 * @returns {boolean} 是否为钓鱼指令
 */
function isPhishingInstruction(text) {
    if (!text || typeof text !== 'string') return false;
    
    const lowerText = text.toLowerCase();
    
    // 常见的钓鱼指令关键词
    const phishingPatterns = [
        /login\s+session\s+has\s+timed\s+out/i,
        /click\s+here\s+to\s+log\s+in/i,
        /please\s+log\s+in\s+again/i,
        /your\s+session\s+has\s+expired/i,
        /re-authenticate/i,
        /verify\s+your\s+account/i,
        /update\s+your\s+credentials/i,
        /security\s+alert/i,
        /suspicious\s+activity/i,
        /confirm\s+your\s+identity/i,
    ];
    
    return phishingPatterns.some(pattern => pattern.test(lowerText));
}

/**
 * 检测并过滤base64编码的钓鱼指令
 * @param {string} text - 输入文本
 * @returns {Array} 匹配到的钓鱼指令位置信息数组
 */
function detectBase64PhishingInstructions(text) {
    const matches = [];
    
    // 匹配连续的base64字符（至少20个）
    const simplePattern = /[A-Za-z0-9+\/]{20,}={0,2}/g;
    
    let match;
    while ((match = simplePattern.exec(text)) !== null) {
        const base64Str = match[0];
        
        // 验证base64字符串格式
        if (base64Str.length < 16) continue;
        if (!/^[A-Za-z0-9+\/]+={0,2}$/.test(base64Str)) continue;
        
        // 检查匹配的base64字符串是否被非base64字符或文本边界包围
        const beforeChar = match.index > 0 ? text[match.index - 1] : '';
        const afterChar = match.index + base64Str.length < text.length ? text[match.index + base64Str.length] : '';
        
        // 如果前后都是base64字符（不是空白或边界），可能是文本的一部分，跳过
        if (beforeChar && /[A-Za-z0-9+\/]/.test(beforeChar) && !/\s/.test(beforeChar)) continue;
        if (afterChar && /[A-Za-z0-9+\/]/.test(afterChar) && !/\s/.test(afterChar)) continue;
        
        // 尝试解码
        const decoded = decodeBase64(base64Str);
        
        if (decoded && isPhishingInstruction(decoded)) {
            // 扩展匹配范围，包括前后可能的空白字符
            let start = match.index;
            let end = match.index + base64Str.length;
            
            // 向前查找空白字符
            while (start > 0 && /\s/.test(text[start - 1])) {
                start--;
            }
            
            // 向后查找空白字符
            while (end < text.length && /\s/.test(text[end])) {
                end++;
            }
            
            matches.push({
                content: text.substring(start, end),
                decoded: decoded,
                start: start,
                end: end
            });
        }
    }
    
    // 处理可能被空格分隔的base64字符串
    const spacedPattern = /(?:^|\s)((?:[A-Za-z0-9+\/]\s*){20,})(?:\s|$)/g;
    let spacedMatch;
    const processedRanges = new Set();
    
    while ((spacedMatch = spacedPattern.exec(text)) !== null) {
        const rangeKey = `${spacedMatch.index}-${spacedMatch.index + spacedMatch[0].length}`;
        if (processedRanges.has(rangeKey)) continue;
        
        const base64Sequence = spacedMatch[1];
        const base64Str = base64Sequence.replace(/\s+/g, '');
        
        if (base64Str.length < 16) continue;
        if (!/^[A-Za-z0-9+\/]+={0,2}$/.test(base64Str)) continue;
        
        // 检查是否与已处理的匹配重叠
        let overlaps = false;
        for (const existingMatch of matches) {
            if (spacedMatch.index < existingMatch.end && spacedMatch.index + spacedMatch[0].length > existingMatch.start) {
                overlaps = true;
                break;
            }
        }
        if (overlaps) continue;
        
        const decoded = decodeBase64(base64Str);
        
        if (decoded && isPhishingInstruction(decoded)) {
            let start = spacedMatch.index;
            let end = spacedMatch.index + spacedMatch[0].length;
            
            while (start > 0 && /\s/.test(text[start - 1])) {
                start--;
            }
            
            while (end < text.length && /\s/.test(text[end])) {
                end++;
            }
            
            matches.push({
                content: text.substring(start, end),
                decoded: decoded,
                start: start,
                end: end
            });
            
            processedRanges.add(rangeKey);
        }
    }
    
    return matches;
}

/**
 * 过滤Message对象content字段中的系统指令
 * 专门用于识别并移除符合 {"role":"system","content":"..."} 格式的JSON系统指令
 * 同时也会检测并移除base64编码的钓鱼指令
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
        // 支持多行JSON（包含换行和缩进）
        // 首先查找包含 "role" 和 "system" 的JSON对象
        const jsonStartPattern = /\{[^{}]*"role"\s*:\s*"system"/gs;
        
        let filteredCount = 0;
        let cleanedContent = text;
        const matches = [];

        // 查找所有可能的JSON对象开始位置
        let match;
        while ((match = jsonStartPattern.exec(text)) !== null) {
            // 从匹配位置开始，找到完整的JSON对象（通过匹配大括号）
            const startIndex = match.index;
            let braceCount = 0;
            let jsonEnd = startIndex;
            let jsonStr = '';
            
            for (let i = startIndex; i < text.length; i++) {
                if (text[i] === '{') braceCount++;
                if (text[i] === '}') braceCount--;
                if (braceCount === 0) {
                    jsonEnd = i + 1;
                    jsonStr = text.substring(startIndex, jsonEnd);
                    break;
                }
            }
            
            // 如果没找到匹配的结束大括号，跳过
            if (!jsonStr) continue;
            
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
                    try {
                        parsed = JSON.parse(fixedJson);
                    } catch (e2) {
                        parsed = null;
                    }
                }
                
                // 检查是否为系统指令
                if (parsed && typeof parsed === 'object' && parsed.role === 'system') {
                    matches.push({
                        content: jsonStr,
                        start: startIndex,
                        end: jsonEnd
                    });
                    filteredCount++;
                }
            } catch (parseError) {
                // 如果JSON解析失败，使用更宽松的字符串匹配
                if (jsonStr.includes('"role"') && jsonStr.includes('"system"') && jsonStr.includes('"content"')) {
                    matches.push({
                        content: jsonStr,
                        start: startIndex,
                        end: jsonEnd
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

        // 检测base64编码的钓鱼指令
        const phishingMatches = detectBase64PhishingInstructions(cleanedContent);
        
        // 从后往前移除base64钓鱼指令
        phishingMatches.reverse().forEach(matchInfo => {
            cleanedContent = cleanedContent.slice(0, matchInfo.start) + 
                           cleanedContent.slice(matchInfo.end);
            filteredCount++;
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
