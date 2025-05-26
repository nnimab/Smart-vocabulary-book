import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// 暫時禁用路由保護，因為這是自用應用程式
export async function middleware(req: NextRequest) {
  // 檢查用戶是否已認證
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const { pathname } = req.nextUrl;

  // 如果用戶已認證，允許訪問
  if (token) {
    return NextResponse.next();
  }

  // 如果用戶未認證，重定向到登入頁面
  // 保存原始 URL 作為 callbackUrl
  const loginUrl = new URL('/login', req.url);
  loginUrl.searchParams.set('callbackUrl', req.url);
  
  return NextResponse.redirect(loginUrl);
}

// 保留 matcher 配置，但實際上不會進行任何保護
export const config = {
  matcher: [
    '/flashcards/:path*', 
    '/vocabulary-books/:path*', 
    '/statistics/:path*', 
    '/settings/:path*'
  ],
}; 