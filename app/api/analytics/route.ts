import { prisma } from "@/lib/prisma";
import { analyticsSchema } from "@/schemas/schemas";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";
import { isBot } from "isbot";

const VISITOR_COOKIE = "analytics_visitor_id";
const SESSION_COOKIE = "analytics_session_id";

const SESSION_MAX_AGE = 60 * 30; // 30 minutes
const VISITOR_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function POST(request: NextRequest) {
  try {
    const userAgent = request.headers.get("user-agent") || "";

    // 1. Early Bot Check via User-Agent (Saves DB/Parsing execution overhead)
    if (isBot(userAgent)) {
      return NextResponse.json({
        skipped: true,
        reason: "Bot detected via UA",
      });
    }

    // 2. Read body stream ONCE
    const body = await request.json();

    // Check for headless client flag sent from body
    if (body.isAutomated) {
      return NextResponse.json({
        skipped: true,
        reason: "Headless browser detected",
      });
    }

    const parsed = analyticsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid analytics event" },
        { status: 400 },
      );
    }

    const { eventId, event, path, referrer, title, projectId, metadata } =
      parsed.data;

    let visitorId = request.cookies.get(VISITOR_COOKIE)?.value;
    let sessionId = request.cookies.get(SESSION_COOKIE)?.value;

    const isNewVisitor = !visitorId;
    const isNewSession = !sessionId;

    if (!visitorId) visitorId = randomUUID();
    if (!sessionId) sessionId = randomUUID();

    const parser = new UAParser(userAgent);
    const deviceType = parser.getDevice().type;
    const browser = parser.getBrowser().name ?? "unknown";
    const os = parser.getOS().name ?? "unknown";

    const device =
      deviceType === "mobile"
        ? "mobile"
        : deviceType === "tablet"
          ? "tablet"
          : "desktop";

    const forwardedCountry = request.headers.get("x-vercel-ip-country");
    const forwardedCity = request.headers.get("x-vercel-ip-city");

    await prisma.analyticsEvent.create({
      data: {
        eventId,
        event,
        visitorId,
        sessionId,
        path,
        referrer,
        title,
        projectId,
        metadata,
        country: forwardedCountry,
        city: forwardedCity,
        device,
        browser,
        os,
      },
    });

    const response = NextResponse.json({ success: true });

    if (isNewVisitor) {
      response.cookies.set({
        name: VISITOR_COOKIE,
        value: visitorId,
        maxAge: VISITOR_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    // Refresh session expiration
    response.cookies.set({
      name: SESSION_COOKIE,
      value: sessionId,
      maxAge: SESSION_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record analytics event" },
      { status: 500 },
    );
  }
}
