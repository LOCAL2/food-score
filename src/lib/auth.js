import DiscordProvider from "next-auth/providers/discord"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "identify email"
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile"
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // สำคัญสำหรับ Vercel
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // ตรวจสอบว่า Discord หรือ Google OAuth สำเร็จ
      try {
        if (account?.provider === "discord" && profile) {
          return true
        }
        if (account?.provider === "google" && profile) {
          return true
        }
        return false
      } catch (error) {
        console.error('SignIn callback error:', error)
        return false
      }
    },
    async session({ session, token }) {
      try {
        // เพิ่มข้อมูล Discord ID หรือ Google ID ลงใน session
        if (token?.discordId) {
          session.user.id = token.discordId
        } else if (token?.googleId) {
          session.user.id = token.googleId
        } else if (token?.sub) {
          session.user.id = token.sub
        }
        return session
      } catch (error) {
        console.error('Session callback error:', error)
        return session
      }
    },
    async jwt({ token, account, profile }) {
      try {
        // เก็บข้อมูลเพิ่มเติมใน JWT token
        if (account && profile) {
          token.accessToken = account.access_token
          if (account.provider === "discord") {
            token.discordId = profile.id
            token.sub = profile.id
          } else if (account.provider === "google") {
            token.googleId = profile.sub
            token.sub = profile.sub
          }
        }
        return token
      } catch (error) {
        console.error('JWT callback error:', error)
        return token
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata)
    },
    warn(code) {
      console.warn('NextAuth Warning:', code)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.log('NextAuth Debug:', code, metadata)
      }
    }
  },
}
