import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { generateId } from "@/lib/format";

const AUTH_KEY = "@hbpr/auth/v1";
const ACCOUNTS_KEY = "@hbpr/accounts/v1";

export type Role = "resident" | "staff";

export type User = {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone?: string;
  suburb?: string;
  staffBadge?: string;
  staffDepartment?: string;
  createdAt: number;
};

type StoredAccount = User & {
  password: string;
};

const STAFF_ACCESS_CODE = "HARARE-WATER-2026";

const SEED_ACCOUNTS: StoredAccount[] = [
  {
    id: "seed-resident",
    role: "resident",
    name: "Tendai Moyo",
    email: "tendai@example.com",
    phone: "+263 77 000 0000",
    suburb: "Mbare",
    password: "password",
    createdAt: Date.now(),
  },
  {
    id: "seed-staff",
    role: "staff",
    name: "Chipo Dube",
    email: "chipo@harare.gov.zw",
    staffBadge: "HW-2041",
    staffDepartment: "Water & Sewerage Control Room",
    password: "password",
    createdAt: Date.now(),
  },
];

async function readAccounts(): Promise<StoredAccount[]> {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
    if (!raw) {
      await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(SEED_ACCOUNTS));
      return SEED_ACCOUNTS;
    }
    return JSON.parse(raw) as StoredAccount[];
  } catch {
    return SEED_ACCOUNTS;
  }
}

async function writeAccounts(accounts: StoredAccount[]): Promise<void> {
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function publicUser(account: StoredAccount): User {
  const { password: _password, ...rest } = account;
  return rest;
}

export type ResidentSignUpInput = {
  name: string;
  email: string;
  phone: string;
  suburb: string;
  password: string;
};

export type StaffSignUpInput = {
  name: string;
  email: string;
  staffBadge: string;
  staffDepartment: string;
  password: string;
  accessCode: string;
};

type AuthContextValue = {
  loading: boolean;
  user: User | null;
  isResident: boolean;
  isStaff: boolean;
  signInResident: (email: string, password: string) => Promise<void>;
  signInStaff: (email: string, password: string) => Promise<void>;
  signUpResident: (input: ResidentSignUpInput) => Promise<void>;
  signUpStaff: (input: StaffSignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Omit<User, "id" | "role" | "createdAt">>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await readAccounts();
        const raw = await AsyncStorage.getItem(AUTH_KEY);
        if (raw && mounted) {
          setUser(JSON.parse(raw) as User);
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persistUser = useCallback(async (next: User | null) => {
    setUser(next);
    if (next) {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(next));
    } else {
      await AsyncStorage.removeItem(AUTH_KEY);
    }
  }, []);

  const signInResident = useCallback(
    async (email: string, password: string) => {
      const trimmed = email.trim().toLowerCase();
      if (!trimmed || !password) throw new Error("Enter your email and password.");
      const accounts = await readAccounts();
      const found = accounts.find(
        (a) => a.role === "resident" && a.email.toLowerCase() === trimmed,
      );
      if (!found) throw new Error("No resident account found for that email.");
      if (found.password !== password) throw new Error("Incorrect password.");
      await persistUser(publicUser(found));
    },
    [persistUser],
  );

  const signInStaff = useCallback(
    async (email: string, password: string) => {
      const trimmed = email.trim().toLowerCase();
      if (!trimmed || !password) throw new Error("Enter your work email and password.");
      const accounts = await readAccounts();
      const found = accounts.find(
        (a) => a.role === "staff" && a.email.toLowerCase() === trimmed,
      );
      if (!found) throw new Error("No municipality account found for that email.");
      if (found.password !== password) throw new Error("Incorrect password.");
      await persistUser(publicUser(found));
    },
    [persistUser],
  );

  const signUpResident = useCallback<AuthContextValue["signUpResident"]>(
    async (input) => {
      const email = input.email.trim().toLowerCase();
      if (!input.name.trim()) throw new Error("Please enter your full name.");
      if (!email || !email.includes("@")) throw new Error("Enter a valid email address.");
      if (input.password.length < 6)
        throw new Error("Password must be at least 6 characters.");

      const accounts = await readAccounts();
      if (accounts.some((a) => a.email.toLowerCase() === email))
        throw new Error("An account with that email already exists.");

      const account: StoredAccount = {
        id: generateId(),
        role: "resident",
        name: input.name.trim(),
        email,
        phone: input.phone.trim() || undefined,
        suburb: input.suburb.trim() || undefined,
        password: input.password,
        createdAt: Date.now(),
      };
      await writeAccounts([...accounts, account]);
      await persistUser(publicUser(account));
    },
    [persistUser],
  );

  const signUpStaff = useCallback<AuthContextValue["signUpStaff"]>(
    async (input) => {
      const email = input.email.trim().toLowerCase();
      if (input.accessCode.trim() !== STAFF_ACCESS_CODE)
        throw new Error("Invalid municipality access code.");
      if (!input.name.trim()) throw new Error("Please enter your full name.");
      if (!email || !email.includes("@"))
        throw new Error("Enter a valid work email address.");
      if (!input.staffBadge.trim()) throw new Error("Enter your staff badge ID.");
      if (input.password.length < 6)
        throw new Error("Password must be at least 6 characters.");

      const accounts = await readAccounts();
      if (accounts.some((a) => a.email.toLowerCase() === email))
        throw new Error("An account with that email already exists.");

      const account: StoredAccount = {
        id: generateId(),
        role: "staff",
        name: input.name.trim(),
        email,
        staffBadge: input.staffBadge.trim(),
        staffDepartment: input.staffDepartment.trim() || "Water & Sewerage",
        password: input.password,
        createdAt: Date.now(),
      };
      await writeAccounts([...accounts, account]);
      await persistUser(publicUser(account));
    },
    [persistUser],
  );

  const signOut = useCallback(async () => {
    await persistUser(null);
  }, [persistUser]);

  const updateProfile = useCallback<AuthContextValue["updateProfile"]>(
    async (patch) => {
      if (!user) return;
      const accounts = await readAccounts();
      const next = accounts.map((a) =>
        a.id === user.id ? { ...a, ...patch } : a,
      );
      await writeAccounts(next);
      const updated = { ...user, ...patch } as User;
      await persistUser(updated);
    },
    [user, persistUser],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      user,
      isResident: user?.role === "resident",
      isStaff: user?.role === "staff",
      signInResident,
      signInStaff,
      signUpResident,
      signUpStaff,
      signOut,
      updateProfile,
    }),
    [
      loading,
      user,
      signInResident,
      signInStaff,
      signUpResident,
      signUpStaff,
      signOut,
      updateProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const STAFF_ACCESS_CODE_HINT = STAFF_ACCESS_CODE;
