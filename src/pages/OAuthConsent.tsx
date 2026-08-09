import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Supabase OAuth 2.1 consent screen. Reached at /.lovable/oauth/consent when
// an MCP client (Claude / ChatGPT / Codex) requests authorization to act as
// the signed-in user. Uses the beta supabase.auth.oauth namespace — cast
// through `any` because it's not yet in the shipping types.
const oauth = (supabase.auth as any).oauth;

type ClientInfo = { name?: string; logo_uri?: string; client_uri?: string };
type AuthorizationDetails = {
  client?: ClientInfo;
  scopes?: string[];
  redirect_url?: string;
  redirect_to?: string;
};

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Missing authorization_id.");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/?next=" + encodeURIComponent(next);
        return;
      }
      try {
        const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
        if (!active) return;
        if (error) return setError(error.message ?? "Could not load authorization request.");
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) {
          window.location.href = immediate;
          return;
        }
        setDetails(data as AuthorizationDetails);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Could not load authorization request.");
      }
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    try {
      const { data, error } = approve
        ? await oauth.approveAuthorization(authorizationId)
        : await oauth.denyAuthorization(authorizationId);
      if (error) {
        setBusy(false);
        return setError(error.message ?? "Could not complete the request.");
      }
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) {
        setBusy(false);
        return setError("No redirect returned by the authorization server.");
      }
      window.location.href = target;
    } catch (e) {
      setBusy(false);
      setError(e instanceof Error ? e.message : "Could not complete the request.");
    }
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold">Authorization unavailable</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </main>
    );
  }
  if (!details) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading authorization request…</p>
      </main>
    );
  }

  const clientName = details.client?.name ?? "an application";
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-6 rounded-2xl border border-border bg-card p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Connect {clientName}</h1>
          <p className="text-sm text-muted-foreground">
            This will let {clientName} call Lovanet MCP tools while acting as your account.
          </p>
        </div>
        {details.scopes && details.scopes.length > 0 && (
          <ul className="text-sm text-muted-foreground list-disc pl-5">
            {details.scopes.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 rounded-full border border-border px-4 py-2 disabled:opacity-60"
          >
            Deny
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 rounded-full bg-primary text-primary-foreground px-4 py-2 disabled:opacity-60"
          >
            Approve
          </button>
        </div>
      </div>
    </main>
  );
}