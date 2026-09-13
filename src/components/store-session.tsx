import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { currentAccount, logoutAccount } from "@/lib/store/functions";
import { getStoreToken, setStoreToken } from "@/lib/store/session";

export type SessionUser = {
  id: number;
  public_id: number;
  username: string;
  first_name: string | null;
  wallet_balance: number;
  is_admin: boolean;
  unreadNotes: number;
};

type StoreSession = {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const Context = createContext<StoreSession | null>(null);

export function StoreSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const next = await currentAccount({ data: { token: getStoreToken() } });
      setUser(next);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback(async (token: string) => {
    setStoreToken(token);
    setLoading(true);
    await refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    setStoreToken(null);
    try {
      await logoutAccount();
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, refresh, signIn, signOut }),
    [user, loading, refresh, signIn, signOut],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useStoreSession() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("StoreSessionProvider missing");
  return ctx;
}
