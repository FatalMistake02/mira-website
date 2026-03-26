"use client";

import { useState } from "react";
import { approveTheme, rejectTheme } from "./actions";

interface ReviewThemeActionsProps {
  themeId: string;
}

export function ReviewThemeActions({ themeId }: ReviewThemeActionsProps) {
  const [isPending, setIsPending] = useState(false);

  const handleApprove = async () => {
    setIsPending(true);
    try {
      await approveTheme(themeId);
    } catch (error) {
      console.error("Failed to approve:", error);
      alert("Failed to approve theme");
    } finally {
      setIsPending(false);
    }
  };

  const handleReject = async () => {
    setIsPending(true);
    try {
      await rejectTheme(themeId);
    } catch (error) {
      console.error("Failed to reject:", error);
      alert("Failed to reject theme");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="review-actions">
      <button
        onClick={handleApprove}
        disabled={isPending}
        className="btn btn-success review-btn"
      >
        {isPending ? "..." : "Approve"}
      </button>
      <button
        onClick={handleReject}
        disabled={isPending}
        className="btn btn-danger review-btn"
      >
        {isPending ? "..." : "Reject"}
      </button>
    </div>
  );
}
