import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/user';
import bcrypt from 'bcryptjs';

// 簡單的密碼重置功能 (生產環境應該發送郵件)
export async function POST(request: Request) {
  try {
    const { email, newPassword, resetCode } = await request.json();

    if (!email || !newPassword || !resetCode) {
      return NextResponse.json({ message: '缺少必要欄位' }, { status: 400 });
    }

    // 簡單的重置代碼驗證 (生產環境應該有更安全的機制)
    const expectedResetCode = "RESET123"; // 這只是示例，生產環境應該使用真實的重置代碼
    if (resetCode !== expectedResetCode) {
      return NextResponse.json({ message: '重置代碼錯誤' }, { status: 400 });
    }

    // 驗證新密碼強度
    function validatePassword(password: string): { isValid: boolean; message?: string } {
      if (password.length < 8) {
        return { isValid: false, message: '密碼長度至少需要 8 個字符' };
      }
      
      if (!/(?=.*[a-z])/.test(password)) {
        return { isValid: false, message: '密碼必須包含至少一個小寫字母' };
      }
      
      if (!/(?=.*[A-Z])/.test(password)) {
        return { isValid: false, message: '密碼必須包含至少一個大寫字母' };
      }
      
      if (!/(?=.*\d)/.test(password)) {
        return { isValid: false, message: '密碼必須包含至少一個數字' };
      }
      
      if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
        return { isValid: false, message: '密碼必須包含至少一個特殊字符 (!@#$%^&*(),.?":{}|<>)' };
      }
      
      return { isValid: true };
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ message: passwordValidation.message }, { status: 400 });
    }

    // 連接到數據庫
    await connectToDatabase();

    // 查找用戶
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: '找不到該電子郵件對應的用戶' }, { status: 404 });
    }

    // 加密新密碼
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 更新用戶密碼
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    return NextResponse.json({ message: '密碼重置成功' }, { status: 200 });
  } catch (error) {
    console.error('Password reset API error:', error);
    return NextResponse.json({ message: '密碼重置過程中發生錯誤' }, { status: 500 });
  }
} 