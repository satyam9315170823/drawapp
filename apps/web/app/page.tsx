import { prismaClient } from "@repo/db/client";
export default async function Home() {
  const user = await prismaClient.user.findFirst()
  return (
    <div>
    hii,helllo salam
    {user?.email}
      {user?.password}
    </div>
  );
}
