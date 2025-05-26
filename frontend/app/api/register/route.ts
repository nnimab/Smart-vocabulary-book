import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/user';
import bcrypt from 'bcryptjs';

// 密碼強度驗證函數
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

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: '缺少必要欄位' }, { status: 400 });
    }

    // 驗證密碼強度
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ message: passwordValidation.message }, { status: 400 });
    }

    // 連接到數據庫
    await connectToDatabase();

    // 檢查電子郵件是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: '此電子郵件已被註冊' }, { status: 409 }); // 409 Conflict
    }

    // 加密密碼
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 創建默認單字本
    const defaultBook = {
      id: "default",
      name: "默認單字本",
      words: [
        { id: "1", word: "apple", definition: "蘋果" },
        { id: "2", word: "banana", definition: "香蕉" },
        { id: "3", word: "orange", definition: "橙子" },
      ],
    };

    // 創建新用戶
    const newUser = new User({
      name,
      email,
      password: hashedPassword, // 使用加密後的密碼
      books: [defaultBook],
      currentBookId: "default",
      createdAt: new Date().toISOString(),
    });

    await newUser.save();

    // 不在註冊後自動登入，讓用戶手動登入
    return NextResponse.json({ message: '註冊成功' }, { status: 201 });
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json({ message: '註冊過程中發生錯誤' }, { status: 500 });
  }
} 