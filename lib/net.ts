import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function getUserAndNetwork() {
  const session = await getServerSession(authOptions as any);
  const discordId = (session as any)?.user?.discordId as string | undefined;
  if (!discordId) return { session: null, user: null, network: null };

  const user = await prisma.user.findUnique({ where: { discordId } });
  if (!user) return { session, user: null, network: null };

  const network = await prisma.network.findFirst({
    where: { members: { some: { userId: user.id } } },
    include: { guilds: true }
  });

  return { session, user, network };
}
