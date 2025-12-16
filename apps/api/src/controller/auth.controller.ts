import type { Request, Response } from "express";
import { PrivyClient } from "@privy-io/server-auth";
import jwt from "jsonwebtoken";

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

        const verifiedClaims = await privy.verifyAuthToken(token);
        const privyId = verifiedClaims.userId;
        const email = (verifiedClaims.email as any)?.address ?? null;

        const sessionToken = signJWT({ userId: privyId });

        return res.json({
            success: true,
            user: {
                id: privyId,
                privyId,
                email,
                createdAt: new Date().toISOString()
            },
            sessionToken
        });
    } catch (err) {
        console.error("Auth error:", err);
        return res.status(401).json({ error: "Invalid token" });
    }
}