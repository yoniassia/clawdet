import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Twitter from 'next-auth/providers/twitter'
import bcrypt from 'bcryptjs'
import { findUserByEmail, findUserByUsername, findUserById, findUserByXId, createUser, updateUserById, linkAccount, findAccountByProvider, type DbUser } from '@/lib/sqlite'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      role: string
      username?: string | null
    }
  }
  interface User {
    role?: string
    username?: string
  }
}

declare module 'next-auth' {
  interface JWT {
    id?: string
    role?: string
    username?: string
  }
}

function dbUserToAuthUser(u: DbUser) {
  return {
    id: u.id,
    email: u.email || undefined,
    name: u.name || u.x_name || u.username || undefined,
    image: u.profile_image || undefined,
    role: u.role,
    username: u.username || u.x_username || undefined,
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        login: { label: 'Email or Username' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const login = credentials?.login as string
        const password = credentials?.password as string
        if (!login || !password) return null

        // Find by email or username
        const user = findUserByEmail(login) || findUserByUsername(login)
        if (!user || !user.password_hash || user.disabled) return null

        const valid = await bcrypt.compare(password, user.password_hash)
        if (!valid) return null

        return dbUserToAuthUser(user)
      },
    }),
  ],

  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'twitter' && profile) {
        const xId = account.providerAccountId
        const xProfile = profile as Record<string, unknown>
        const xData = (xProfile.data as Record<string, unknown>) || xProfile
        const xUsername = (xData.username as string) || ''
        const xName = (xData.name as string) || ''
        const profileImage = (xData.profile_image_url as string) || ''

        // Check if we already have this X account linked
        const existingAccount = findAccountByProvider('twitter', xId)
        if (existingAccount) {
          const dbUser = findUserById(existingAccount.user_id)
          if (dbUser && !dbUser.disabled) {
            // Update X info
            updateUserById(dbUser.id, { x_username: xUsername, x_name: xName, profile_image: profileImage })
            user.id = dbUser.id
            user.role = dbUser.role
            user.username = dbUser.username || xUsername
            return true
          }
          return false
        }

        // Check if there's a user with same X id (migrated from old system)
        let dbUser = findUserByXId(xId)
        if (dbUser) {
          if (dbUser.disabled) return false
          linkAccount({ user_id: dbUser.id, provider: 'twitter', provider_account_id: xId, access_token: account.access_token || undefined, refresh_token: account.refresh_token || undefined })
          updateUserById(dbUser.id, { x_username: xUsername, x_name: xName, profile_image: profileImage })
          user.id = dbUser.id
          user.role = dbUser.role
          user.username = dbUser.username || xUsername
          return true
        }

        // Create new user for X sign-in
        const now = Date.now()
        const newId = `user_${now}_${Math.random().toString(36).substring(7)}`
        dbUser = createUser({
          id: newId,
          username: xUsername,
          name: xName,
          x_id: xId,
          x_username: xUsername,
          x_name: xName,
          profile_image: profileImage,
          role: 'user',
          paid: 0,
          terms_accepted: 0,
          email_verified: 0,
          disabled: 0,
          created_at: now,
          updated_at: now,
        })
        linkAccount({ user_id: dbUser.id, provider: 'twitter', provider_account_id: xId, access_token: account.access_token || undefined, refresh_token: account.refresh_token || undefined })
        user.id = dbUser.id
        user.role = dbUser.role
        user.username = xUsername
        return true
      }

      // Credentials: user already validated in authorize()
      return true
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || 'user'
        token.username = (user as any).username
      }
      // Allow session update
      if (trigger === 'update' && session) {
        if (session.role) token.role = session.role
        if (session.username) token.username = session.username
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as string) || 'user'
        session.user.username = token.username as string
      }
      return session
    },
  },
})
