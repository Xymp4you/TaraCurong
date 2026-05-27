"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// A pending employer is still authenticated, so navigating to "/" or "/login"
// just bounces back here (middleware redirects logged-in users to their portal,
// and the employer layout gate redirects non-approved employers back to this
// page). The only way out is to sign out, which clears the session.
export function PendingActions() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await createClient().auth.signOut();
    } finally {
      // Full reload so the now-anonymous request passes through middleware cleanly.
      window.location.assign("/");
    }
  };

  return (
    <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="gw-btn gw-btn--accent"
      >
        Sign out
      </button>
      <Link href="/help">
        <button type="button" className="gw-btn gw-btn--ghost">Contact support</button>
      </Link>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm sign out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out? You&apos;ll need to sign in again to
              check your approval status.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSignOut} disabled={loading}>
              {loading ? "Signing out…" : "Sign out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
