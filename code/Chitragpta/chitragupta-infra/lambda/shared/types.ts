export type EntryType = 'PUNYA' | 'PAAPA';

export type EntryStatus = 'PENDING' | 'ACTIVE' | 'REMOVED_POLICY' | 'REMOVED_LEGAL';

// One item per feedback entry: PK = USER#<subjectUsername>, SK = LEDGER#<type>#<ulid>.
// Kept as its own item (never embedded in the profile item) so a heavily-targeted
// user's ledger cannot push a single item past DynamoDB's 400KB limit.
export interface LedgerEntry {
  PK: string;
  SK: string;
  type: EntryType;
  status: EntryStatus;
  text: string;
  submitterId: string;
  createdAt: string;
  // Only set while status is PENDING (paapa's 72h subject-preview window).
  publishAt?: string;
  reportedBy?: string[];
  // GSI1: entries submitted BY a given user (rate limiting, "my submissions").
  GSI1PK: string;
  GSI1SK: string;
  // GSI2: sparse index of PENDING paapa entries, keyed by when they're due to
  // publish. Removed once the entry becomes ACTIVE, so the index only ever
  // holds what's still waiting.
  GSI2PK?: 'PENDING_PAAPA';
  GSI2SK?: string;
}

// One item per user: PK = USER#<username>, SK = PROFILE. Counts and summaries
// live here; the ledger itself never does.
export interface UserProfile {
  PK: string;
  SK: 'PROFILE';
  username: string;
  email: string;
  ledgerEnabled: boolean;
  punyaCount: number;
  paapaCount: number;
  punyaSummary: string;
  paapaSummary: string;
}
