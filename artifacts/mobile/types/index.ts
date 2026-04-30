export type ReportStatus =
  | "submitted"
  | "acknowledged"
  | "in_progress"
  | "resolved";

export type Severity = "low" | "medium" | "high";

export type LocationInfo = {
  latitude: number | null;
  longitude: number | null;
  address: string;
};

export type StatusEvent = {
  status: ReportStatus;
  at: number;
  note?: string;
};

export type Report = {
  id: string;
  ticketId: string;
  description: string;
  severity: Severity;
  location: LocationInfo;
  imageUri: string | null;
  reporterName: string;
  status: ReportStatus;
  createdAt: number;
  updatedAt: number;
  history: StatusEvent[];
  isSeed?: boolean;
};

export type Draft = {
  id: string;
  description: string;
  severity: Severity;
  location: LocationInfo;
  imageUri: string | null;
  reporterName: string;
  updatedAt: number;
};

export type NoticeType = "disruption" | "maintenance" | "restoration";

export type Notice = {
  id: string;
  title: string;
  body: string;
  type: NoticeType;
  area: string;
  createdAt: number;
  startsAt?: number;
  endsAt?: number;
};
