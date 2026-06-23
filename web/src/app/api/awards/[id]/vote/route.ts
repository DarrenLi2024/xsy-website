import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

function hashIP(ip: string): string {
  return createHash("sha256").update(ip + "xinshiye-salt").digest("hex");
}

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [campaign, voteCount, userVoted] = await Promise.all([
    prisma.awardCampaign.findUnique({
      where: { id },
      select: { id: true, active: true, endDate: true, title: true },
    }),
    prisma.awardVote.count({ where: { campaignId: id } }),
    (async () => {
      const ip = getClientIP(req);
      const ipHash = hashIP(ip);
      const vote = await prisma.awardVote.findUnique({
        where: { campaignId_ipHash: { campaignId: id, ipHash } },
      });
      return !!vote;
    })(),
  ]);

  if (!campaign) {
    return NextResponse.json({ error: "评选活动不存在" }, { status: 404 });
  }

  const isActive = campaign.active && new Date(campaign.endDate) > new Date();

  return NextResponse.json({
    title: campaign.title,
    voteCount,
    userVoted,
    isActive,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const campaign = await prisma.awardCampaign.findUnique({
    where: { id },
    select: { id: true, active: true, endDate: true },
  });

  if (!campaign) {
    return NextResponse.json({ error: "评选活动不存在" }, { status: 404 });
  }

  if (!campaign.active) {
    return NextResponse.json({ error: "该评选活动已结束" }, { status: 400 });
  }

  if (new Date(campaign.endDate) < new Date()) {
    return NextResponse.json({ error: "该评选活动已过投票截止日期" }, { status: 400 });
  }

  const ip = getClientIP(req);
  const ipHash = hashIP(ip);

  // Check if already voted
  const existingVote = await prisma.awardVote.findUnique({
    where: { campaignId_ipHash: { campaignId: id, ipHash } },
  });

  if (existingVote) {
    return NextResponse.json({ error: "您已为该活动投过票，每IP限投一票" }, { status: 409 });
  }

  // Parse optional companyId and fingerprint from body
  let companyId: string | null = null;
  let fingerprint: string | null = null;
  try {
    const body = await req.json().catch(() => ({}));
    companyId = body.companyId || null;
    fingerprint = body.fingerprint || null;
  } catch {}

  const vote = await prisma.awardVote.create({
    data: {
      campaignId: id,
      companyId,
      ipHash,
      fingerprint,
    },
  });

  const voteCount = await prisma.awardVote.count({ where: { campaignId: id } });

  return NextResponse.json({
    ok: true,
    voteCount,
    message: "投票成功！",
  });
}
