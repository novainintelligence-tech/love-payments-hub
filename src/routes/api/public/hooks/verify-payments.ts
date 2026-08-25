import { createFileRoute } from "@tanstack/react-router";

/** Scheduled sweep: re-checks submitted crypto payments and expires stale invoices. */
export const Route = createFileRoute("/api/public/hooks/verify-payments")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = request.headers.get("apikey") ?? "";
        const expected = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? "";
        if (!expected || apiKey !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          const { sweepPendingPayments } = await import("@/lib/store/bot.server");
          const result = await sweepPendingPayments();
          return Response.json({ ok: true, ...result });
        } catch (error) {
          console.error("[verify-payments]", error);
          return Response.json({ ok: false, error: "sweep failed" }, { status: 500 });
        }
      },
    },
  },
});
