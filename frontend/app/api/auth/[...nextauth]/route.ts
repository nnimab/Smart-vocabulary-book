import NextAuth, { type AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/user';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "電子郵件", type: "email", placeholder: "user@example.com" },
        password: { label: "密碼", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          console.log('=== 登入嘗試開始 ===');
          console.log('Email:', credentials?.email);
          console.log('Password length:', credentials?.password?.length);

          if (!credentials?.email || !credentials?.password) {
            console.log('❌ 缺少憑證');
            return null;
          }

          // 連接到數據庫
          await connectToDatabase();
          console.log('✅ 數據庫連接成功');

          // 查找用戶
          const user = await User.findOne({ email: credentials.email });
          console.log('用戶查詢結果:', user ? '找到用戶' : '未找到用戶');
          
          if (user) {
            console.log('用戶ID:', user._id);
            console.log('用戶名稱:', user.name);
            console.log('存儲的密碼前10字符:', user.password.substring(0, 10));
          }

          if (!user) {
            console.log('❌ 用戶不存在');
            return null;
          }

          // 使用 bcrypt 驗證密碼
          console.log('開始密碼驗證...');
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          console.log('密碼驗證結果:', isPasswordValid ? '✅ 成功' : '❌ 失敗');

          if (isPasswordValid) {
            console.log('🎉 認證成功');
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
            };
          } else {
            console.log('❌ 密碼不匹配');
            return null;
          }
        } catch (error) {
          console.error("❌ 授權錯誤:", error);
          return null;
        }
      },
    }),
    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt", // 使用 JWT 來管理 session
  },
  pages: {
    signIn: '/login', // 指定自訂的登入頁面路徑
    error: '/login', // 錯誤時也導向登入頁面
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" || account?.provider === "google") {
        try {
          await connectToDatabase();
          
          // 檢查用戶是否已存在
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // 為 OAuth 用戶創建新帳戶
            const defaultBook = {
              id: "default",
              name: "默認單字本",
              words: [
                { id: "1", word: "apple", definition: "蘋果" },
                { id: "2", word: "banana", definition: "香蕉" },
                { id: "3", word: "orange", definition: "橙子" },
              ],
            };

            const newUser = new User({
              name: user.name || user.email?.split('@')[0],
              email: user.email,
              password: "", // OAuth 用戶不需要密碼
              books: [defaultBook],
              currentBookId: "default",
              createdAt: new Date().toISOString(),
            });

            await newUser.save();
          }
        } catch (error) {
          console.error("OAuth 用戶創建錯誤:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // 非常重要：設定一個密鑰
  debug: true, // 啟用調試模式
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST } 