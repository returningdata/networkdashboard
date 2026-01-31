import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "@/lib/db";

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify guilds guilds.join" } }
    })
  ],
  session: { strategy: "jwt" as const },
  callbacks: {
    async jwt({ token, account, profile }: any) {
      if (profile) {
        token.discordId = profile.id;
        token.username = profile.username;
        token.avatar = profile.avatar;
      }
      if (account?.access_token) token.discordAccessToken = account.access_token;
      if (account?.refresh_token) token.discordRefreshToken = account.refresh_token;
      if (account?.expires_at) token.discordExpiresAt = account.expires_at;
      return token;
    },
    async session({ session, token }: any) {
      (session.user as any).discordId = token.discordId;
      (session.user as any).username = token.username;
      (session.user as any).avatar = token.avatar;
      (session as any).discordAccessToken = token.discordAccessToken;
      (session as any).discordExpiresAt = token.discordExpiresAt;
      return session;
    },
    async signIn({ profile }: any) {
      await prisma.user.upsert({
        where: { discordId: profile.id },
        update: { username: profile.username, avatar: profile.avatar },
        create: { discordId: profile.id, username: profile.username, avatar: profile.avatar }
      });
      return true;
    }
  }
};

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };
