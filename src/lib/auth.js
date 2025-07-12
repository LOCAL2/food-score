import DiscordProvider from "next-auth/providers/discord"

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    })
  ],
  callbacks: {
    async session({ session, token }) {
      // เพิ่มข้อมูล Discord ID ลงใน session
      if (token?.discordId) {
        session.user.id = token.discordId
      } else if (token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, account, profile }) {
      // เก็บข้อมูลเพิ่มเติมใน JWT token
      if (account && profile) {
        token.accessToken = account.access_token
        token.discordId = profile.id
        token.sub = profile.id
      }
      return token
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
}
