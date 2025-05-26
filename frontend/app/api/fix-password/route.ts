import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/user';
import bcrypt from 'bcryptjs';

// 臨時的密碼修復API - 用於解決雙重加密問題
export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json({ message: '缺少必要欄位' }, { status: 400 });
    }

    // 連接到數據庫
    await connectToDatabase();

    // 查找用戶
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: '找不到該電子郵件對應的用戶' }, { status: 404 });
    }

    // 重新加密密碼（只加密一次）
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 直接更新密碼，繞過任何可能的pre-save hook
    await User.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    return NextResponse.json({ message: '密碼修復成功' }, { status: 200 });
  } catch (error) {
    console.error('Password fix API error:', error);
    return NextResponse.json({ message: '密碼修復過程中發生錯誤' }, { status: 500 });
  }
} 