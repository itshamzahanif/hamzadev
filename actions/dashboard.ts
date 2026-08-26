"use server";

import { getSession } from "@/lib/authSession";
import { prisma } from "@/lib/prisma";
import { AnalyticsData, Stat } from "@/types/types";

export async function dashboardData({
  startDate,
  endDate,
}: {
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "Unauthorised" };
    }
    const messages = await prisma.contactMessage.findMany();
    const skills = await prisma.skill.findMany();
    const projects = await prisma.project.findMany();
    const pageViews = await prisma.analyticsEvent.count({
      where: {
        event: "page_view",
        browser: {
          not: "Chrome Headless",
        },
        createdAt: {
          gte: startDate || undefined,
          lt: endDate || undefined,
        },
      },
    });

    const stats: Stat[] = [
      {
        title: "Projects",
        key: "projects",
        total: projects.length,
      },
      {
        title: "Messages",
        key: "messages",
        total: messages.length,
        unread: messages.filter((message) => !message.read).length,
      },
      {
        title: "Skills",
        key: "skills",
        total: skills.length,
      },
      {
        title: "Views",
        key: "views",
        total: pageViews,
      },
    ];

    return {
      stats,
    };
  } catch (err) {
    console.error("Dashboard data error:", err);
    throw new Error("Failed to load dashboard data");
  }
}

export async function getPageViews({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: Date;
}) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "Unauthorised" };
    }
    const now = new Date();

    const days = Number(startDate) || 90;

    const calculatedStartDate = new Date(now);
    calculatedStartDate.setDate(calculatedStartDate.getDate() - days);

    const calculatedEndDate = endDate ?? now;

    const dailyPageViews = await prisma.$queryRaw<
      {
        date: Date;
        views: bigint;
      }[]
    >`
      SELECT
        DATE_TRUNC('day', "createdAt") AS date,
        COUNT(*) AS views
      FROM "AnalyticsEvent"
      WHERE
        "event" = 'page_view'
        AND "browser" != 'Chrome Headless'
        AND "createdAt" >= ${calculatedStartDate}
        AND "createdAt" < ${calculatedEndDate}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC;
    `;

    const chartData = dailyPageViews.map((item) => ({
      date: item.date,
      views: Number(item.views),
    }));

    return {
      success: true,
      dailyPageViewsData: chartData,
      dates: {
        startDate: calculatedStartDate,
        endDate: calculatedEndDate,
      },
    };
  } catch (err) {
    console.error("Views fetching err", err);

    return {
      success: false,
      message: "Error fetching views",
    };
  }
}

export async function analytics() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "Unauthorised" };
    }
    const referrers = await prisma.analyticsEvent.groupBy({
      by: ["referrer"],
      where: {
        event: "page_view",
        // createdAt: {
        //   gte: startDate ||,
        //   lt: endDate,
        // },
        browser: {
          not: "Chrome Headless",
        },
        referrer: {
          not: null,
        },
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          referrer: "desc",
        },
      },
      take: 10,
    });

    const formattedReferrers = referrers.map((item) => ({
      referrer: item.referrer
        ? item.referrer
            .replace(/^https?:\/\//, "")
            .replace(/^www\./, "")
            .replace(/\/$/, "")
        : null,
      count: item._count._all,
    }));

    const eventCounts = await prisma.analyticsEvent.groupBy({
      by: ["event"],
      where: {
        // createdAt: {
        //   gte: startDate,
        //   lt: endDate,
        // },
        browser: {
          not: "Chrome Headless",
        },
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          event: "desc",
        },
      },
    });

    const formattedEventCounts = eventCounts.map((item) => ({
      event: item.event,
      count: item._count._all,
    }));

    const devices = await prisma.analyticsEvent.groupBy({
      by: ["device"],
      where: {
        event: "page_view",
        // createdAt: {
        //   gte: startDate,
        //   lt: endDate,
        // },
        browser: {
          not: "Chrome Headless",
        },
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          device: "desc",
        },
      },
    });

    const formattedDevicesCount = devices.map((item) => {
      const formattedDeviceName = item.device
        ? item.device.charAt(0).toUpperCase() +
          item.device.slice(1).toLowerCase()
        : item.device;

      return {
        device: formattedDeviceName,
        count: item._count._all,
      };
    });

    const countries = await prisma.analyticsEvent.groupBy({
      by: ["country"],
      where: {
        event: "page_view",
        // createdAt: {
        //   gte: startDate,
        //   lt: endDate,
        // },
        browser: {
          not: "Chrome Headless",
        },
        country: {
          not: null,
        },
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          country: "desc",
        },
      },
      take: 10,
    });

    const formattedCountries = countries.map((item) => ({
      country: getCountryName(item.country || ""),
      count: item._count._all,
    }));

    const cities = await prisma.analyticsEvent.groupBy({
      by: ["city"],
      where: {
        event: "page_view",
        browser: {
          not: "Chrome Headless",
        },
        city: {
          not: null,
        },
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          city: "desc",
        },
      },
      take: 10,
    });

    const formattedCities = cities.map((city) => ({
      city: decodeURIComponent(city.city || ""),
      count: city._count._all,
    }));

    const projectClicks = await prisma.analyticsEvent.groupBy({
      by: ["projectId"],
      where: {
        event: "project_demo_click",
        // createdAt: {
        //   gte: startDate,
        //   lt: endDate,
        // },
        browser: {
          not: "Chrome Headless",
        },
        projectId: {
          not: null,
        },
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          projectId: "desc",
        },
      },
    });

    const formattedProjectsClicks = projectClicks.map((item) => ({
      project: item.projectId,
      count: item._count._all,
    }));

    return {
      success: true,
      data: {
        countries: formattedCountries,
        cities: formattedCities,
        referrers: formattedReferrers,
        eventCounts: formattedEventCounts,
        devices: formattedDevicesCount,
        projectClick: formattedProjectsClicks,
      } satisfies AnalyticsData,
    };
  } catch (err) {
    console.error("Analytics fetching err", err);

    return {
      success: false,
      message: "Error fetching analytics",
    };
  }
}
export async function getMessages() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "Unauthorised" };
    }
    const messages = await prisma.contactMessage.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, messages };
  } catch (err) {
    console.error("Dashboard data error:", err);
    throw new Error("Failed to load dashboard data");
  }
}

const getCountryName = (code: string): string => {
  try {
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
};
