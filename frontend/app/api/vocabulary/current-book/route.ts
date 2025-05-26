import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/user';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// 獲取用戶的當前單字本 ID
export async function GET() {
  try {
    // 獲取用戶會話
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
    }
    
    // 連接到數據庫
    await connectToDatabase();
    
    // 查找用戶
    const user = await User.findOne({ email: session.user.email }).select('currentBookId');
    
    if (!user) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }
    
    // 返回當前單字本 ID
    return NextResponse.json({ currentBookId: user.currentBookId || null });
  } catch (error) {
    console.error('API 錯誤:', error);
    return NextResponse.json({ error: '獲取當前單字本 ID 時出錯' }, { status: 500 });
  }
}

// 更新用戶當前單字本 ID
export async function PUT(request: Request) {
  try {
    // 獲取用戶會話
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
    }
    
    // 解析請求體
    const { currentBookId } = await request.json();
    
    if (currentBookId === undefined) {
      return NextResponse.json({ error: '缺少必要數據' }, { status: 400 });
    }
    
    // 連接到數據庫
    await connectToDatabase();
    
    // 查找並更新用戶
    await User.findOneAndUpdate(
      { email: session.user.email },
      { currentBookId },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: '當前單字本 ID 更新成功',
      currentBookId
    });
  } catch (error) {
    console.error('API 錯誤:', error);
    return NextResponse.json({ error: '更新當前單字本 ID 時出錯' }, { status: 500 });
  }
} 