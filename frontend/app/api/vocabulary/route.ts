import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/user';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// 獲取用戶的所有單字本
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
    const user = await User.findOne({ email: session.user.email }).select('books');
    
    if (!user) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }
    
    // 返回用戶的單字本
    return NextResponse.json({ books: user.books || [] });
  } catch (error) {
    console.error('API 錯誤:', error);
    return NextResponse.json({ error: '獲取單字本時出錯' }, { status: 500 });
  }
}

// 更新用戶的單字本
export async function PUT(request: Request) {
  try {
    // 獲取用戶會話
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
    }
    
    // 解析請求體
    const { books, currentBookId } = await request.json();
    
    if (!books) {
      return NextResponse.json({ error: '缺少必要數據' }, { status: 400 });
    }
    
    // 連接到數據庫
    await connectToDatabase();
    
    // 查找並更新用戶
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { books },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: '單字本更新成功',
      books: user.books
    });
  } catch (error) {
    console.error('API 錯誤:', error);
    return NextResponse.json({ error: '更新單字本時出錯' }, { status: 500 });
  }
}

// 添加一個單字本
export async function POST(request: Request) {
  try {
    // 獲取用戶會話
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
    }
    
    // 解析請求體
    const { book } = await request.json();
    
    if (!book || !book.id || !book.name) {
      return NextResponse.json({ error: '缺少必要數據' }, { status: 400 });
    }
    
    // 連接到數據庫
    await connectToDatabase();
    
    // 查找用戶
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }
    
    // 添加單字本
    user.books.push(book);
    await user.save();
    
    return NextResponse.json({ 
      success: true, 
      message: '單字本添加成功',
      books: user.books
    });
  } catch (error) {
    console.error('API 錯誤:', error);
    return NextResponse.json({ error: '添加單字本時出錯' }, { status: 500 });
  }
} 