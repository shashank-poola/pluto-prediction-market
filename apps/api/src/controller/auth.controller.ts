import type { Request, Response } from "express";
import { PrivyClient } from "@privy-io/node";
import jwt from "jsonwebtoken";
import prisma from "db-pluto";

const privy = new PrivyClient(
    process.env.PRIVY_APP_ID!,
    process.env.PRIVY_APP_SECRET!
);

function signJWT(payload: { userId: string }): string {
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });
}

export async function privyAuthHandler(req: Request, res: Response) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "Missing Token" });
        }

        const token = authHeader.replace("Bearer ", "");

        // Verify the Privy token
        const verifiedClaims = await privy.verifyAuthToken(token);
        const privyId = verifiedClaims.userId;
        const email = (verifiedClaims.email as any)?.address ?? null;

        // Check if user exists in database
        let user = await prisma.user.findUnique({
            where: { privyId }
        });

        // If user doesn't exist, create a new one
        if (!user) {
            user = await prisma.user.create({
                data: {
                    privyId,
                    email: email || undefined
                }
            });
        }

        // Generate JWT session token
        const sessionToken = signJWT({ userId: user.id });

        return res.json({
            success: true,
            user: {
                id: user.id,
                privyId: user.privyId,
                email: user.email,
                createdAt: user.createdAt
            },
            sessionToken
        });
    } catch (err) {
        console.error("Auth error:", err);
        return res.status(401).json({ error: "Invalid token" });
    }
}