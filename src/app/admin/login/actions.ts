'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const user = await prisma.adminUser.findUnique({ where: { email } })

  // DBにユーザーが存在しない場合は初期化用に.envも許容する（完全なロックアウトを防ぐため）
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const isEnvAdmin = email === adminEmail && password === adminPassword

  if ((user && bcrypt.compareSync(password, user.password)) || isEnvAdmin) {
    // ログイン成功: クッキーをセット（簡易的なセッション管理）
    const cookieStore = await cookies()
    cookieStore.set('admin_session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24時間
      path: '/',
    })
    
    // 権限管理のために admin_id も保存 (envログインなら 'global')
    const adminId = isEnvAdmin ? 'global' : user!.id
    cookieStore.set('admin_id', adminId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })
    
    redirect('/admin')
  } else {
    // ログイン失敗: エラーを返す
    return { error: 'IDまたはパスワードが正しくありません。' }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  cookieStore.delete('admin_id')
  redirect('/admin/login')
}
