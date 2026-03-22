import type {
  AuditLog,
  Claim,
  ClaimAttachment,
  ClaimStatus,
  LegalEntity,
  Team,
  User,
  WorkspaceData,
  WorkspaceSettings,
} from './types';

export type {
  AuditLog,
  Claim,
  ClaimAttachment,
  ClaimStatus,
  LegalEntity,
  Team,
  User,
  WorkspaceData,
  WorkspaceSettings,
} from './types';

const STORAGE_KEY = 'pettybox.workspace.v1';

const defaultSettings: WorkspaceSettings = {
  workspaceName: 'PettyBox Finance',
  baseCurrency: 'USD',
  approvalThreshold: 500,
  autoSync: true,
  aiExtractionEnabled: false,
};

const seedEntities: LegalEntity[] = [
  { id: 'le-1', name: 'Acme Corp', d365_data_area_id: 'USMF', currency: 'USD', status: 'active' },
  { id: 'le-2', name: 'Acme Europe', d365_data_area_id: 'DEMF', currency: 'EUR', status: 'active' },
];

const seedTeams: Team[] = [
  { id: 't-1', name: 'Finance US', legal_entity_id: 'le-1', manager: 'John Manager', member_count: 4 },
  { id: 't-2', name: 'Marketing US', legal_entity_id: 'le-1', manager: 'Maya Lead', member_count: 3 },
  { id: 't-3', name: 'Finance EU', legal_entity_id: 'le-2', manager: 'Elena Supervisor', member_count: 2 },
];

const seedUsers: User[] = [
  { id: 'u-1', name: 'Alice Employee', role: 'employee', team_id: 't-1' },
  { id: 'u-2', name: 'John Manager', role: 'manager', team_id: 't-1' },
  { id: 'u-3', name: 'Maya Lead', role: 'manager', team_id: 't-2' },
];

const createAttachment = (claimId: string, name: string, type: string): ClaimAttachment => ({
  id: `att-${crypto.randomUUID()}`,
  claim_id: claimId,
  file_name: name,
  file_type: type,
  file_url: '',
  uploaded_at: new Date().toISOString(),
});

const seedClaims: Claim[] = [
  {
    id: 'cl-1',
    user_id: 'u-1',
    team_id: 't-1',
    legal_entity_id: 'le-1',
    status: 'submitted',
    total_amount: 1450,
    created_at: '2026-03-20T10:00:00Z',
    description: 'Office supplies replenishment',
    notes: 'Awaiting manager review',
    attachments: [createAttachment('cl-1', 'office-supplies.pdf', 'application/pdf')],
  },
  {
    id: 'cl-2',
    user_id: 'u-1',
    team_id: 't-1',
    legal_entity_id: 'le-1',
    status: 'approved',
    total_amount: 320.5,
    created_at: '2026-03-21T14:30:00Z',
    voucher_reference: 'VOU-001',
    description: 'Client lunch',
    notes: 'Ready for sync',
    attachments: [createAttachment('cl-2', 'client-lunch.jpg', 'image/jpeg')],
  },
  {
    id: 'cl-3',
    user_id: 'u-1',
    team_id: 't-3',
    legal_entity_id: 'le-2',
    status: 'synced',
    total_amount: 5000,
    created_at: '2026-03-15T09:15:00Z',
    voucher_reference: 'VOU-002',
    description: 'Software licenses',
    notes: 'Exported to finance ledger',
    attachments: [createAttachment('cl-3', 'licenses.xlsx', 'application/vnd.ms-excel')],
  },
];

const seedAuditLogs: AuditLog[] = [
  { id: 'log-1', claim_id: 'cl-1', user_id: 'u-2', action: 'submitted', timestamp: '2026-03-20T10:05:00Z' },
  { id: 'log-2', claim_id: 'cl-2', user_id: 'u-2', action: 'approved', timestamp: '2026-03-21T15:30:00Z' },
];

const seedWorkspace = (): WorkspaceData => ({
  entities: seedEntities,
  teams: seedTeams,
  users: seedUsers,
  claims: seedClaims,
  auditLogs: seedAuditLogs,
  settings: defaultSettings,
});

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function cloneWorkspace(data: WorkspaceData) {
  return structuredClone(data);
}

function readWorkspace(): WorkspaceData {
  if (!canUseStorage()) {
    return cloneWorkspace(seedWorkspace());
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedWorkspace();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return cloneWorkspace(seeded);
  }

  try {
    return { ...seedWorkspace(), ...JSON.parse(raw) } as WorkspaceData;
  } catch {
    const seeded = seedWorkspace();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return cloneWorkspace(seeded);
  }
}

function writeWorkspace(nextData: WorkspaceData) {
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
  }
  return cloneWorkspace(nextData);
}

function updateWorkspace(updater: (current: WorkspaceData) => WorkspaceData) {
  const current = readWorkspace();
  return writeWorkspace(updater(current));
}

function delay(ms = 150) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function buildVoucherReference(claims: Claim[]) {
  const count = claims.filter((claim) => Boolean(claim.voucher_reference)).length + 1;
  return `VOU-${String(count).padStart(3, '0')}`;
}

export function resetWorkspaceData() {
  const seeded = seedWorkspace();
  return writeWorkspace(seeded);
}

export async function getWorkspaceData() {
  await delay();
  return readWorkspace();
}

export async function getSettings() {
  await delay();
  return readWorkspace().settings;
}

export async function updateSettings(settings: WorkspaceSettings) {
  await delay();
  return updateWorkspace((current) => ({ ...current, settings })).settings;
}

export async function getDashboardStats() {
  await delay();
  const { claims, settings } = readWorkspace();
  const approvedTotal = claims
    .filter((claim) => claim.status === 'approved' || claim.status === 'synced')
    .reduce((acc, claim) => acc + claim.total_amount, 0);

  return {
    imprestBalance: 25000 - approvedTotal,
    pendingApprovals: claims.filter((claim) => claim.status === 'submitted').length,
    syncedClaims: claims.filter((claim) => claim.status === 'synced').length,
    baseCurrency: settings.baseCurrency,
  };
}

export async function getClaims() {
  await delay();
  return readWorkspace().claims.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getEntities() {
  await delay();
  return readWorkspace().entities;
}

export async function getTeams() {
  await delay();
  return readWorkspace().teams;
}

export async function addEntity(entity: Omit<LegalEntity, 'id'>) {
  await delay();
  const id = `le-${crypto.randomUUID().slice(0, 8)}`;
  const nextEntity: LegalEntity = { id, ...entity };
  return updateWorkspace((current) => ({
    ...current,
    entities: [nextEntity, ...current.entities],
  })).entities[0];
}

export async function updateEntityStatus(id: string, status: LegalEntity['status']) {
  await delay();
  const data = updateWorkspace((current) => ({
    ...current,
    entities: current.entities.map((entity) => (entity.id === id ? { ...entity, status } : entity)),
  }));
  return data.entities.find((entity) => entity.id === id) ?? null;
}

export async function addTeam(team: Omit<Team, 'id'>) {
  await delay();
  const id = `t-${crypto.randomUUID().slice(0, 8)}`;
  const nextTeam: Team = { id, ...team };
  return updateWorkspace((current) => ({
    ...current,
    teams: [nextTeam, ...current.teams],
  })).teams[0];
}

export async function addClaim(claim: Omit<Claim, 'id' | 'created_at' | 'attachments' | 'voucher_reference'> & { attachmentFiles?: Array<{ name: string; type: string }> }) {
  await delay(250);
  const id = `cl-${crypto.randomUUID().slice(0, 8)}`;
  const attachments = (claim.attachmentFiles ?? []).map((file) => createAttachment(id, file.name, file.type));
  const nextClaim: Claim = {
    id,
    created_at: new Date().toISOString(),
    voucher_reference: claim.status === 'approved' || claim.status === 'synced' ? buildVoucherReference(readWorkspace().claims) : undefined,
    attachments,
    user_id: claim.user_id,
    team_id: claim.team_id,
    legal_entity_id: claim.legal_entity_id,
    status: claim.status,
    total_amount: claim.total_amount,
    description: claim.description,
    notes: claim.notes,
  };

  updateWorkspace((current) => ({
    ...current,
    claims: [nextClaim, ...current.claims],
    auditLogs: [
      {
        id: `log-${crypto.randomUUID().slice(0, 8)}`,
        claim_id: id,
        user_id: nextClaim.user_id,
        action: 'created',
        timestamp: nextClaim.created_at,
      },
      ...current.auditLogs,
    ],
  }));

  return nextClaim;
}

export async function updateClaimStatus(id: string, status: ClaimStatus) {
  await delay(300);
  const data = updateWorkspace((current) => ({
    ...current,
    claims: current.claims.map((claim) => {
      if (claim.id !== id) {
        return claim;
      }

      return {
        ...claim,
        status,
        voucher_reference:
          status === 'approved' || status === 'synced'
            ? claim.voucher_reference ?? buildVoucherReference(current.claims)
            : claim.voucher_reference,
      };
    }),
    auditLogs: [
      {
        id: `log-${crypto.randomUUID().slice(0, 8)}`,
        claim_id: id,
        user_id: current.users[1]?.id ?? current.users[0]?.id ?? 'system',
        action: status,
        timestamp: new Date().toISOString(),
      },
      ...current.auditLogs,
    ],
  }));

  return data.claims.find((claim) => claim.id === id) ?? null;
}
