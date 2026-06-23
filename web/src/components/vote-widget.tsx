"use client";

import { useState, useEffect } from "react";
import { ThumbsUp } from "lucide-react";

type VoteData = {
  voteCount: number;
  userVoted: boolean;
  isActive: boolean;
};

export default function VoteWidget({ campaignId }: { campaignId: string }) {
  const [data, setData] = useState<VoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/awards/${campaignId}/vote`)
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [campaignId]);

  const handleVote = async () => {
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch(`/api/awards/${campaignId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (res.ok) {
        setData((prev) => prev ? { ...prev, voteCount: json.voteCount, userVoted: true } : null);
        setMessage("投票成功！");
      } else {
        setMessage(json.error || "投票失败");
      }
    } catch {
      setMessage("网络错误，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="h-14 animate-pulse rounded-lg bg-slate-100" />
      </div>
    );
  }

  if (!data) return null;

  const { voteCount, userVoted, isActive } = data;

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-medium text-[#6e6e73]">实时投票数</p>
          <p className="mt-1 text-[1.75rem] font-bold tracking-tight text-[#1d1d1f]">
            {voteCount.toLocaleString("zh-CN")}
          </p>
        </div>

        {isActive ? (
          <button
            onClick={handleVote}
            disabled={userVoted || submitting}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold transition-all ${
              userVoted
                ? "bg-emerald-50 text-emerald-600 cursor-default"
                : "bg-[var(--accent)] text-white hover:opacity-90 active:scale-[0.97]"
            } disabled:opacity-60`}
          >
            <ThumbsUp className="h-4 w-4" />
            {submitting ? "投票中..." : userVoted ? "已投票" : "投一票"}
          </button>
        ) : (
          <span className="rounded-full bg-slate-100 px-5 py-3 text-[13px] font-medium text-[#86868b]">
            投票已结束
          </span>
        )}
      </div>

      {message && (
        <p className={`mt-3 text-[13px] ${
          message.includes("成功") ? "text-emerald-600" : "text-red-500"
        }`}>
          {message}
        </p>
      )}

      {userVoted && isActive && (
        <p className="mt-3 text-[12px] text-[#aeaeb2]">感谢您的参与！每IP限投一票。</p>
      )}
    </div>
  );
}
