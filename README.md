# 智慧單字書 (Smart Vocabulary Book)

一個給我自己用的基於艾賓浩斯遺忘曲線的智能單字學習應用，幫助用戶高效記憶和複習單字。 (還在開發中)
![image](https://github.com/user-attachments/assets/2a3c7273-f568-4cbb-b5a6-c77cb6f6128e)


## 🌟 主要功能

### 📚 單字學習
- **單字卡學習**：支援卡片翻轉動畫，直觀顯示單字和釋義
- **左右滑動記憶**：左滑標記為不熟悉，右滑標記為熟悉
- **隨機學習模式**：打亂單字順序，增加學習挑戰性
- **艾賓浩斯遺忘曲線**：基於科學記憶理論安排複習時間

### 📊 學習統計
- **學習活躍度熱圖**：視覺化顯示每日學習情況
- **記憶曲線圖表**：追蹤學習進度和記憶效果
- **掌握率統計**：實時顯示單字掌握程度
- **錯誤次數追蹤**：識別難點單字，重點複習

### 📖 單字管理
- **單字本管理**：創建和管理多個主題單字本
- **批量匯入**：支援文本、CSV、文件上傳等多種格式
- **熟悉度分類**：自動分類已掌握、學習中、需複習的單字
- **跨設備同步**：雲端數據庫確保數據安全和同步

### 🔐 用戶系統
- **多種登入方式**：支援帳號密碼、GitHub、Google OAuth
- **密碼安全**：bcrypt 加密存儲，密碼強度驗證
- **密碼重置**：完整的忘記密碼流程
- **訪客模式**：未登入用戶可使用本地存儲功能

## 🛠️ 技術架構

### 前端技術
- **框架**：Next.js 14 (App Router)
- **UI 庫**：React + TypeScript
- **樣式**：Tailwind CSS + shadcn/ui
- **狀態管理**：React Hooks + Context
- **圖表**：Recharts
- **認證**：NextAuth.js

### 後端技術
- **API**：Next.js API Routes
- **數據庫**：MongoDB Atlas (雲端)
- **認證**：NextAuth.js + JWT
- **密碼加密**：bcryptjs
- **類型安全**：TypeScript

### 開發工具
- **版本控制**：Git + GitHub
- **包管理**：pnpm
- **代碼規範**：ESLint + Prettier
- **開發環境**：Node.js

## 🚀 快速開始

### 環境要求
- Node.js 18.0 或更高版本
- pnpm (推薦) 或 npm
- MongoDB Atlas 帳戶 (用於雲端數據庫)

### 安裝步驟

1. **克隆專案**
```bash
git clone https://github.com/nnimab/Smart-vocabulary-book.git
cd Smart-vocabulary-book
```

2. **安裝依賴**
```bash
# 前端依賴
cd frontend
pnpm install

# 後端依賴 (如需要)
cd ../backend
npm install
```

3. **環境變量配置**

在 `frontend` 目錄下創建 `.env.local` 文件：

```env
# MongoDB 連接字串
MONGODB_URI=your_mongodb_atlas_connection_string

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# GitHub OAuth (可選)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google OAuth (可選)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

4. **啟動開發服務器**
```bash
cd frontend
pnpm dev
```

5. **訪問應用**
打開瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

## 📁 專案結構

```
智慧單字書/
├── frontend/                 # 前端應用
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API 路由
│   │   ├── flashcards/     # 單字卡頁面
│   │   ├── statistics/     # 統計頁面
│   │   └── vocabulary-books/ # 單字本管理
│   ├── components/         # React 組件
│   │   ├── ui/            # UI 基礎組件
│   │   ├── flash-card.tsx # 單字卡組件
│   │   └── navbar.tsx     # 導航欄
│   ├── hooks/             # 自定義 Hooks
│   ├── lib/               # 工具函數和配置
│   └── types/             # TypeScript 類型定義
├── backend/               # 後端 API (備用)
├── changelog.md          # 更新日誌
├── 開發計畫.md           # 開發計畫
└── README.md            # 專案說明
```

## 🎯 使用指南

### 開始學習
1. **註冊/登入**：創建帳戶或使用 OAuth 登入
2. **創建單字本**：在單字本管理頁面創建新的學習主題
3. **匯入單字**：使用批量匯入功能添加單字
4. **開始學習**：進入單字卡頁面開始學習

### 學習技巧
- **左滑**：標記單字為不熟悉，系統會安排更頻繁的複習
- **右滑**：標記單字為熟悉，延長下次複習時間
- **隨機模式**：打亂學習順序，避免順序記憶
- **查看統計**：定期檢查學習進度和掌握情況

## 🔧 開發說明

### 本地開發
```bash
# 啟動開發服務器
pnpm dev

# 構建生產版本
pnpm build

# 啟動生產服務器
pnpm start
```

### 數據庫設置
1. 註冊 [MongoDB Atlas](https://www.mongodb.com/atlas) 免費帳戶
2. 創建新的集群
3. 設置數據庫用戶和網路存取權限
4. 獲取連接字串並配置到環境變量

### OAuth 設置
詳細的 OAuth 配置說明請參考 `frontend/env-setup.md`

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📝 更新日誌

詳細的更新記錄請查看 [CHANGELOG.md](./changelog.md)

## 📄 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 文件

## 👨‍💻 作者

**nnimab** - [GitHub](https://github.com/nnimab)

## 🙏 致謝

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [shadcn/ui](https://ui.shadcn.com/) - UI 組件庫
- [MongoDB Atlas](https://www.mongodb.com/atlas) - 雲端數據庫
- [NextAuth.js](https://next-auth.js.org/) - 認證解決方案

---

如果這個專案對您有幫助，請給個 ⭐ Star！ 
