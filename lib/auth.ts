/**
 * Auth.js v5 Configuration
 * Supports: Email/Password + X/Twitter OAuth
 */
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Twitter from 'next-auth/providers/twitter'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // X/Twitter OAuth 2.0
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    }),

    // Email + Password
    Credentials({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const { findUserByEmail } = await import('@/lib/sqlite')

        const user = findUserByEmail(credentials.email as string)
        if (!user || !user.password_hash) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        )
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email || '',
          name: user.name || user.x_name || 'User',
          image: user.profile_image || undefined,
        }
      },
    }),
  ],

  pages: {
    signIn: '/login',
    error: '/login',
    newUser: '/dashboard',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'twitter' && profile) {
        // Create or update X user in our database
        try {
          const { findUserByXId, createUser, updateUserById } = await import('@/lib/sqlite')
          
          const xId = profile.data?.id || profile.id || account.providerAccountId
          const xUsername = profile.data?.username || (profile as any).screen_name || ''
          const xName = profile.data?.name || profile.name || ''
          const profileImage = profile.data?.profile_image_url || (profile as any).profile_image_url_https || ''

          const existing = findUserByXId(xId)
          const now = Date.now()

          if (existing) {
            updateUserById(existing.id, {
              x_username: xUsername,
              x_name: xName,
              profile_image: profileImage,
              updated_at: now,
            })
            // Override the user id so JWT gets our internal id
            user.id = existing.id
          } else {
            const id = `user_${now}_${Math.random().toString(36).substring(7)}`
            createUser({
              id,
              email: `${xUsername}@x.twitter.com`,
              x_id: xId,
              x_username: xUsername,
              x_name: xName,
              profile_image: profileImage,
              terms_accepted: 1,
              paid: 0,
              role: 'user',
              disabled: 0,
              created_at: now,
              updated_at: now,
            } as any)
            user.id = id
          }
        } catch (err) {
          console.error('[Auth] X OAuth user upsert error:', err)
        }
      }
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },

    async session({ session, token }) {
      if (token?.sub && session.user) {
        (session.user as any).id = token.sub
      }
      return session
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
})
