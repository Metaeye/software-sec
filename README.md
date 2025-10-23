# OpenAI Chat - 智能对话助手

基于 Vite 和 JavaScript 构建的现代化 OpenAI 对话应用，支持文件上传和智能分析。

## ✨ 功能特性

### 🤖 智能对话
- **流式对话**: 实时显示 AI 回复，提供流畅的对话体验
- **消息历史**: 自动保存对话记录，支持历史回顾
- **多模型支持**: 支持 GPT-3.5、GPT-4 等多种 OpenAI 模型
- **消息格式化**: 支持 Markdown 格式，代码高亮显示

### 📁 文件处理
- **多文件上传**: 支持拖拽上传和批量选择
- **格式支持**: TXT, MD, JSON, CSV, HTML, CSS, JS, TS, PY 等文本文件
- **内容预览**: 实时预览文件内容和解析结果
- **智能分析**: AI 可以分析和回答关于上传文件的问题

### 🎨 现代化界面
- **响应式设计**: 完美适配桌面和移动设备
- **暗色主题**: 优雅的配色方案，保护视力
- **流畅动画**: 精心设计的交互动效
- **直观操作**: 简洁易用的用户界面

### 🔒 安全可靠
- **本地存储**: API 密钥安全存储在本地
- **错误处理**: 完善的错误提示和处理机制
- **数据保护**: 不会上传或泄露用户数据

## 🚀 快速开始

### 环境要求
- Node.js 16+ 
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 安装运行

1. **克隆项目**
   ```bash
   git clone https://github.com/Metaeye/software-sec.git
   cd software-sec
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **打开浏览器**
   访问 `http://localhost:5173`

### 配置 API Key

1. 点击左侧边栏的"设置"按钮
2. 输入您的 OpenAI API Key
3. 选择要使用的模型（推荐 GPT-4）
4. 点击"测试连接"验证配置

> **获取 API Key**: 访问 [OpenAI Platform](https://platform.openai.com/api-keys) 创建您的 API Key

## 📖 使用指南

### 基础对话
1. 在底部输入框中输入您的问题
2. 按 Enter 发送消息（Shift + Enter 换行）
3. AI 将实时流式回复您的问题

### 文件上传分析
1. 点击左侧边栏的"文件"按钮
2. 拖拽文件到上传区域或点击选择文件
3. 等待文件处理完成
4. 在对话中询问关于文件的问题

### 快捷操作
- **新建对话**: 点击侧边栏"新对话"按钮
- **清空历史**: 在设置中点击"清空对话历史"
- **复制消息**: 点击 AI 回复旁的复制按钮
- **下载文件**: 在文件面板中点击下载按钮

## 🛠️ 技术架构

### 前端技术栈
- **构建工具**: Vite 7.x
- **开发语言**: JavaScript ES6+
- **样式框架**: Tailwind CSS
- **HTTP 客户端**: Axios
- **状态管理**: 自定义 Store（观察者模式）

### 项目结构
```
src/
├── components/          # UI 组件
│   ├── App.js          # 主应用组件
│   ├── Sidebar.js      # 侧边栏组件
│   ├── ChatContainer.js # 聊天容器
│   ├── FilePanel.js    # 文件面板
│   ├── SettingsPanel.js # 设置面板
│   └── ErrorToast.js   # 错误提示
├── services/           # 业务服务
│   ├── openaiService.js # OpenAI API 服务
│   └── fileService.js  # 文件处理服务
├── stores/             # 状态管理
│   └── appStore.js     # 应用状态
├── utils/              # 工具函数
│   └── helpers.js      # 通用工具
└── assets/             # 静态资源
    └── icons/          # 图标文件
```

### 核心特性实现

#### 流式对话
使用 Server-Sent Events (SSE) 实现实时流式响应：
```javascript
await openaiService.sendChatMessageStream(messages, (chunk) => {
  // 实时更新消息内容
  this.handleStreamChunk(chunk);
});
```

#### 文件处理
支持多种文本格式的解析和预览：
```javascript
const results = await fileService.processFiles(files, (progress) => {
  this.updateProgress(progress);
});
```

#### 状态管理
使用观察者模式实现响应式状态管理：
```javascript
appStore.subscribe((newState) => {
  this.state = newState;
  this.updateContent();
});
```

## 🔧 开发指南

### 本地开发
```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 代码规范
- 使用 ES6+ 语法
- 遵循模块化设计原则
- 添加详细的 JSDoc 注释
- 使用语义化的变量和函数命名

### 自定义配置
可以通过修改以下文件来自定义应用：
- `tailwind.config.js` - 样式主题配置
- `src/stores/appStore.js` - 默认状态配置
- `src/services/openaiService.js` - API 配置

## 🐛 常见问题

### API Key 相关
**Q: API Key 存储在哪里？**
A: API Key 使用 localStorage 安全存储在浏览器本地，不会上传到服务器。

**Q: 支持哪些 OpenAI 模型？**
A: 支持所有 OpenAI Chat Completions API 的模型，包括 GPT-3.5-turbo、GPT-4 等。

### 文件上传相关
**Q: 支持哪些文件格式？**
A: 支持所有文本格式文件，包括 .txt、.md、.json、.csv、.html、.css、.js、.py 等。

**Q: 文件大小限制是多少？**
A: 单个文件最大支持 10MB。

### 使用问题
**Q: 为什么消息发送失败？**
A: 请检查：1) API Key 是否正确配置 2) 网络连接是否正常 3) API 额度是否充足

**Q: 如何清空所有数据？**
A: 在设置面板中点击"清空对话历史"和"清空文件"，或清除浏览器的 localStorage。

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📞 支持

如果您在使用过程中遇到问题，请：
1. 查看本文档的常见问题部分
2. 在 GitHub 上提交 Issue
3. 查看浏览器控制台的错误信息

---

**享受与 AI 的智能对话体验！** 🎉