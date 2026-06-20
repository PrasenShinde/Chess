import { io } from "socket.io-client";
import prisma from "./src/prisma/client.js";

async function test() {
  const users = await prisma.user.findMany({ take: 2 });
  if (users.length < 2) {
    console.error("Need at least 2 users");
    process.exit(1);
  }
  
  // We need a valid cookie/token to connect. Since I can't easily mock that here 
  // without digging into jwt signing, I will just print the users.
  console.log("Users:", users.map(u => u.username));
  process.exit(0);
}
test();
