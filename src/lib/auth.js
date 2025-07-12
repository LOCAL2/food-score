import DiscordProvider from "next-auth/providers/discord"

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
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // สำคัญสำหรับ Vercel
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // ตรวจสอบว่า Discord OAuth สำเร็จ
      try {
        if (account?.provider === "discord" && profile) {
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
        // เพิ่มข้อมูล Discord ID ลงใน session
        if (token?.discordId) {
          session.user.id = token.discordId
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
          token.discordId = profile.id
          token.sub = profile.id
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
