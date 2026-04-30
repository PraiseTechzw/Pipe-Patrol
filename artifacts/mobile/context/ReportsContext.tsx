import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { generateId, generateTicketId } from "@/lib/format";
import type {
  Draft,
  LocationInfo,
  Notice,
  Report,
  ReportStatus,
  Severity,
} from "@/types";

const REPORTS_KEY = "@hbpr/reports/v1";
const DRAFTS_KEY = "@hbpr/drafts/v1";
const NOTICES_KEY = "@hbpr/notices/v1";
const PROFILE_KEY = "@hbpr/profile/v1";

const HARARE_CENTER = { latitude: -17.8252, longitude: 31.0335 };

function seedReports(): Report[] {
  const now = Date.now();
  return [
    {
      id: "seed-1",
      ticketId: "HRE-204188-3021",
      description:
        "Major burst on the corner of Samora Machel and Julius Nyerere — water gushing into the road.",
      severity: "high",
      location: {
        latitude: -17.8292,
        longitude: 31.0522,
        address: "Cnr Samora Machel & Julius Nyerere, CBD",
      },
      imageUri: null,
      reporterName: "Tendai M.",
      status: "in_progress",
      createdAt: now - 1000 * 60 * 60 * 5,
      updatedAt: now - 1000 * 60 * 30,
      history: [
        {
          status: "submitted",
          at: now - 1000 * 60 * 60 * 5,
          note: "Reported by citizen",
        },
        {
          status: "acknowledged",
          at: now - 1000 * 60 * 60 * 4,
          note: "Logged by control room",
        },
        {
          status: "in_progress",
          at: now - 1000 * 60 * 30,
          note: "Repair crew on site",
        },
      ],
      isSeed: true,
    },
    {
      id: "seed-2",
      ticketId: "HRE-204055-1144",
      description:
        "Slow leak at the meter box, water pooling in the pavement near Avondale Shops.",
      severity: "medium",
      location: {
        latitude: -17.7944,
        longitude: 31.0408,
        address: "King George Rd, Avondale",
      },
      imageUri: null,
      reporterName: "Rumbi C.",
      status: "acknowledged",
      createdAt: now - 1000 * 60 * 60 * 18,
      updatedAt: now - 1000 * 60 * 60 * 6,
      history: [
        { status: "submitted", at: now - 1000 * 60 * 60 * 18 },
        {
          status: "acknowledged",
          at: now - 1000 * 60 * 60 * 6,
          note: "Scheduled for tomorrow",
        },
      ],
      isSeed: true,
    },
    {
      id: "seed-3",
      ticketId: "HRE-203998-7720",
      description:
        "Burst pipe outside Mbare Musika gate — strong flow, blocking foot traffic.",
      severity: "high",
      location: {
        latitude: -17.8688,
        longitude: 31.0349,
        address: "Mbare Musika, Mbare",
      },
      imageUri: null,
      reporterName: "Anonymous",
      status: "submitted",
      createdAt: now - 1000 * 60 * 90,
      updatedAt: now - 1000 * 60 * 90,
      history: [{ status: "submitted", at: now - 1000 * 60 * 90 }],
      isSeed: true,
    },
    {
      id: "seed-4",
      ticketId: "HRE-203501-5566",
      description: "Underground burst, sinkhole forming in the road shoulder.",
      severity: "high",
      location: {
        latitude: -17.8044,
        longitude: 31.0689,
        address: "Enterprise Rd, Highlands",
      },
      imageUri: null,
      reporterName: "Farai N.",
      status: "resolved",
      createdAt: now - 1000 * 60 * 60 * 48,
      updatedAt: now - 1000 * 60 * 60 * 12,
      history: [
        { status: "submitted", at: now - 1000 * 60 * 60 * 48 },
        { status: "acknowledged", at: now - 1000 * 60 * 60 * 40 },
        { status: "in_progress", at: now - 1000 * 60 * 60 * 24 },
        {
          status: "resolved",
          at: now - 1000 * 60 * 60 * 12,
          note: "Pipe section replaced",
        },
      ],
      isSeed: true,
    },
  ];
}

function seedNotices(): Notice[] {
  const now = Date.now();
  return [
    {
      id: "n-1",
      title: "Water shedding — Western suburbs",
      body: "Supply will be intermittent in Warren Park, Kuwadzana and Dzivarasekwa from 06:00 to 18:00 while Morton Jaffray pumps recover. Store water in advance.",
      type: "disruption",
      area: "Western suburbs",
      createdAt: now - 1000 * 60 * 60 * 3,
      startsAt: now + 1000 * 60 * 60 * 8,
      endsAt: now + 1000 * 60 * 60 * 20,
    },
    {
      id: "n-2",
      title: "Scheduled main valve replacement",
      body: "Crews will replace the 600mm main valve on Seke Road on Saturday 06:00 — 14:00. Expect no supply in Hatfield, Cranborne and surrounding areas.",
      type: "maintenance",
      area: "Hatfield / Cranborne",
      createdAt: now - 1000 * 60 * 60 * 9,
    },
    {
      id: "n-3",
      title: "Restoration: Avondale & Belgravia",
      body: "Repairs on the 300mm trunk are complete. Supply is being restored gradually. Discoloured water is normal for the first 30 minutes — flush a single tap until clear.",
      type: "restoration",
      area: "Avondale / Belgravia",
      createdAt: now - 1000 * 60 * 60 * 22,
    },
  ];
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export type NewReportInput = {
  description: string;
  severity: Severity;
  location: LocationInfo;
  imageUri: string | null;
  reporterName: string;
  fromDraftId?: string;
};

type ReportsContextValue = {
  loading: boolean;
  reports: Report[];
  drafts: Draft[];
  notices: Notice[];
  reporterName: string;
  setReporterName: (name: string) => Promise<void>;
  submitReport: (input: NewReportInput) => Promise<Report>;
  saveDraft: (
    draft: Omit<Draft, "id" | "updatedAt"> & { id?: string },
  ) => Promise<Draft>;
  deleteDraft: (id: string) => Promise<void>;
  advanceStatus: (
    reportId: string,
    nextStatus: ReportStatus,
    note?: string,
  ) => Promise<void>;
  resetSampleData: () => Promise<void>;
  defaultLocation: typeof HARARE_CENTER;
};

const ReportsContext = createContext<ReportsContextValue | null>(null);

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [reporterName, setReporterNameState] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [storedReports, storedDrafts, storedNotices, storedProfile] =
        await Promise.all([
          readJson<Report[] | null>(REPORTS_KEY, null),
          readJson<Draft[]>(DRAFTS_KEY, []),
          readJson<Notice[] | null>(NOTICES_KEY, null),
          readJson<{ name?: string }>(PROFILE_KEY, {}),
        ]);

      let initialReports = storedReports;
      if (!initialReports) {
        initialReports = seedReports();
        await writeJson(REPORTS_KEY, initialReports);
      }
      let initialNotices = storedNotices;
      if (!initialNotices) {
        initialNotices = seedNotices();
        await writeJson(NOTICES_KEY, initialNotices);
      }

      if (!mounted) return;
      setReports(initialReports);
      setDrafts(storedDrafts);
      setNotices(initialNotices);
      setReporterNameState(storedProfile.name ?? "");
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persistReports = useCallback(async (next: Report[]) => {
    setReports(next);
    await writeJson(REPORTS_KEY, next);
  }, []);

  const persistDrafts = useCallback(async (next: Draft[]) => {
    setDrafts(next);
    await writeJson(DRAFTS_KEY, next);
  }, []);

  const setReporterName = useCallback(async (name: string) => {
    setReporterNameState(name);
    await writeJson(PROFILE_KEY, { name });
  }, []);

  const submitReport = useCallback(
    async (input: NewReportInput) => {
      const now = Date.now();
      const report: Report = {
        id: generateId(),
        ticketId: generateTicketId(),
        description: input.description.trim(),
        severity: input.severity,
        location: input.location,
        imageUri: input.imageUri,
        reporterName: input.reporterName.trim() || "Anonymous",
        status: "submitted",
        createdAt: now,
        updatedAt: now,
        history: [{ status: "submitted", at: now, note: "Submitted by you" }],
      };
      const nextReports = [report, ...reports];
      await persistReports(nextReports);
      if (input.fromDraftId) {
        const nextDrafts = drafts.filter((d) => d.id !== input.fromDraftId);
        await persistDrafts(nextDrafts);
      }
      return report;
    },
    [reports, drafts, persistReports, persistDrafts],
  );

  const saveDraft = useCallback<ReportsContextValue["saveDraft"]>(
    async (input) => {
      const now = Date.now();
      const id = input.id ?? generateId();
      const draft: Draft = {
        id,
        description: input.description,
        severity: input.severity,
        location: input.location,
        imageUri: input.imageUri,
        reporterName: input.reporterName,
        updatedAt: now,
      };
      const exists = drafts.some((d) => d.id === id);
      const next = exists
        ? drafts.map((d) => (d.id === id ? draft : d))
        : [draft, ...drafts];
      await persistDrafts(next);
      return draft;
    },
    [drafts, persistDrafts],
  );

  const deleteDraft = useCallback(
    async (id: string) => {
      await persistDrafts(drafts.filter((d) => d.id !== id));
    },
    [drafts, persistDrafts],
  );

  const advanceStatus = useCallback<ReportsContextValue["advanceStatus"]>(
    async (reportId, nextStatus, note) => {
      const now = Date.now();
      const next = reports.map((r) => {
        if (r.id !== reportId) return r;
        return {
          ...r,
          status: nextStatus,
          updatedAt: now,
          history: [...r.history, { status: nextStatus, at: now, note }],
        };
      });
      await persistReports(next);
    },
    [reports, persistReports],
  );

  const resetSampleData = useCallback(async () => {
    const fresh = seedReports();
    const freshNotices = seedNotices();
    await Promise.all([
      writeJson(REPORTS_KEY, fresh),
      writeJson(NOTICES_KEY, freshNotices),
      writeJson(DRAFTS_KEY, []),
    ]);
    setReports(fresh);
    setNotices(freshNotices);
    setDrafts([]);
  }, []);

  const value = useMemo<ReportsContextValue>(
    () => ({
      loading,
      reports,
      drafts,
      notices,
      reporterName,
      setReporterName,
      submitReport,
      saveDraft,
      deleteDraft,
      advanceStatus,
      resetSampleData,
      defaultLocation: HARARE_CENTER,
    }),
    [
      loading,
      reports,
      drafts,
      notices,
      reporterName,
      setReporterName,
      submitReport,
      saveDraft,
      deleteDraft,
      advanceStatus,
      resetSampleData,
    ],
  );

  return (
    <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
  );
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error("useReports must be used within ReportsProvider");
  return ctx;
}
