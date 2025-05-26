# 環境變量配置說明

請在 `frontend` 目錄下創建 `.env.local` 文件，並添加以下環境變量：

## 必需的環境變量

```bash
# NextAuth 配置
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# MongoDB 數據庫連接
MONGODB_URI=mongodb://localhost:27017/vocabulary-app
```

## 可選的 OAuth 環境變量

如果您想啟用 GitHub 和 Google 登入功能，請添加以下變量：

```bash
# GitHub OAuth
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 設置說明

### 1. NEXTAUTH_SECRET
生成一個隨機的密鑰：
```bash
openssl rand -base64 32
```

### 2. GitHub OAuth 設置
1. 前往 https://github.com/settings/applications/new
2. 創建新的 OAuth App
3. 設置 Authorization callback URL 為 `http://localhost:3000/api/auth/callback/github`
4. 復制 Client ID 和 Client Secret

### 3. Google OAuth 設置
1. 前往 https://console.developers.google.com/
2. 創建新項目或選擇現有項目
3. 啟用 Google+ API
4. 創建 OAuth 2.0 憑證
5. 設置重定向 URI 為 `http://localhost:3000/api/auth/callback/google`
6. 復制 Client ID 和 Client Secret

### 4. MongoDB 設置
- 本地安裝：使用 `mongodb://localhost:27017/vocabulary-app`
- MongoDB Atlas：使用您的 Atlas 連接字符串

## 注意事項

- 請確保 `.env.local` 文件已添加到 `.gitignore` 中
- 不要在代碼中暴露任何密鑰
- 生產環境請使用適當的 NEXTAUTH_URL 值 