import { Request, Response, NextFunction } from "express";
import { verifyToken, createClerkClient } from "@clerk/backend";
import prisma from "../config/db";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  try {
    const verified = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    const clerkId = verified.sub;
    req.clerkId = clerkId;

    // Fetch user from DB
    let user = await prisma.user.findUnique({
      where: { clerkId },
    });

    // JIT Provisioning: If user not in DB, fetch from Clerk and create
    if (!user) {
      console.log(`JIT Provisioning for Clerk user: ${clerkId}`);
      try {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        const name =
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          null;

        user = await prisma.user.create({
          data: {
            clerkId,
            email,
            name,
          },
        });
        console.log(`Successfully created user record for: ${clerkId}`);
      } catch (clerkError) {
        console.error("Error during JIT provisioning:", clerkError);
        return res
          .status(404)
          .json({
            message: "User record not found and could not be provisioned.",
          });
      }
    }

    req.userId = user.id;
    req.userPlan = user.plan;

    next();
  } catch (error) {
    console.error("Auth verification error:", error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
