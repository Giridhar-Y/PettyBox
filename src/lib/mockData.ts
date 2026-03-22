export interface LegalEntity {
  id: string;
  name: string;
  d365_data_area_id: string;
}

export interface Team {
  id: string;
  name: string;
  legal_entity_id: string;
}

export interface User {
  id: string;
  name: string;
  role: 'employee' | 'manager' | 'admin';
  team_id: string;
}

export interface Claim {
  id: string;
  user_id: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'synced';
  total_amount: number;
  voucher_reference?: string;
  created_at: string;
  description: string;
}

export interface ClaimAttachment {
  id: string;
  claim_id: string;
  file_url: string;
  file_type: string;
  file_name: string;
}

export interface AuditLog {
  id: string;
  claim_id: string;
  user_id: string;
  action: string;
  timestamp: string;
}

// Mock Data
export const mockEntities: LegalEntity[] = [
  { id: 'le-1', name: 'Acme Corp', d365_data_area_id: 'USMF' },
  { id: 'le-2', name: 'Acme Europe', d365_data_area_id: 'DEMF' },
];

export const mockTeams: Team[] = [
  { id: 't-1', name: 'Finance US', legal_entity_id: 'le-1' },
  { id: 't-2', name: 'Marketing US', legal_entity_id: 'le-1' },
];

export const mockUsers: User[] = [
  { id: 'u-1', name: 'Alice Employee', role: 'employee', team_id: 't-1' },
  { id: 'u-2', name: 'John Manager', role: 'manager', team_id: 't-1' },
];

export const mockClaims: Claim[] = [
  { id: 'cl-1', user_id: 'u-1', status: 'submitted', total_amount: 1450.00, created_at: '2026-03-20T10:00:00Z', description: 'Office Supplies Q1' },
  { id: 'cl-2', user_id: 'u-1', status: 'approved', total_amount: 320.50, created_at: '2026-03-21T14:30:00Z', voucher_reference: 'VOU-001', description: 'Client Lunch' },
  { id: 'cl-3', user_id: 'u-1', status: 'synced', total_amount: 5000.00, created_at: '2026-03-15T09:15:00Z', voucher_reference: 'VOU-002', description: 'Software Licenses' },
];

// Mock Service Functions
export async function getDashboardStats() {
  const approvedTotal = mockClaims
    .filter(c => c.status === 'approved' || c.status === 'synced')
    .reduce((acc, c) => acc + c.total_amount, 0);

  return {
    imprestBalance: 25000.00 - approvedTotal,
    pendingApprovals: mockClaims.filter(c => c.status === 'submitted').length,
    syncedClaims: mockClaims.filter(c => c.status === 'synced').length,
  };
}

export async function getClaims() {
  return mockClaims;
}

export async function getEntities() {
  return mockEntities;
}

export async function getTeams() {
  return mockTeams;
}

export async function updateClaimStatus(id: string, status: Claim['status']) {
  const claim = mockClaims.find(c => c.id === id);
  if (claim) {
    claim.status = status;
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600)); 
  }
  return claim;
}

export async function addClaim(claim: Claim) {
  mockClaims.unshift(claim);
  await new Promise(resolve => setTimeout(resolve, 1000));
}
