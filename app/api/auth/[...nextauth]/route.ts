import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import TwitterProvider from 'next-auth/providers/twitter'
import bcrypt from 'bcryptjs'

const handler = NextAuth({
  providers: [
    // X/Twitter OAuth
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
      version: '2.0',
    }),
    
    // Email/Password
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        // Import database and bcrypt
        const { findUserByEmail } = await import('@/lib/db')
        
        // Find user by email
        const user = findUserByEmail(credentials.email)
        
        if (!user || !user.passwordHash) {
          throw new Error('Invalid email or password')
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        
        if (!isValid) {
          throw new Error('Invalid email or password')
        }

        // Return user data (password hash excluded)
        return {
          id: user.id,
          email: user.email,
          name: user.name || user.xName || 'User',
        }
      },
    }),
  ],
  
  pages: {
    signIn: '/signup',
    error: '/signup',
  },
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle X OAuth
      if (account?.provider === 'twitter') {
        // Store X profile data
        // TODO: Create or update user in database
        return true
      }
      
      // Handle email sign in
      if (account?.provider === 'credentials') {
        return true
      }
      
      return true
    },
    
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        // @ts-ignore - extending default session type
        session.user.id = token.sub
      }
      return session
    },
  },
  
  session: {
    strategy: 'jwt',
  },
  
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-change-in-production',
})

export { handler as GET, handler as POST }
