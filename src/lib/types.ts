export type EntityStatus = 'active' | 'inactive';
export type ClaimStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'synced';

export interface LegalEntity {
  id: string;
  name: string;
  d365_data_area_id: string;
  currency: string;
  status: EntityStatus;
}

export interface Team {
  id: string;
  name: string;
  legal_entity_id: string;
  manager: string;
  member_count: number;
}

export interface User {
  id: string;
  name: string;
  role: 'employee' | 'manager' | 'admin';
  team_id: string;
}

export interface ClaimAttachment {
  id: string;
  claim_id: string;
  file_url: string;
  file_type: string;
  file_name: string;
  uploaded_at: string;
}

export interface Claim {
  id: string;
  user_id: string;
  team_id: string;
  legal_entity_id: string;
  status: ClaimStatus;
  total_amount: number;
  voucher_reference?: string;
  created_at: string;
  description: string;
  notes?: string;
  attachments: ClaimAttachment[];
}

export interface AuditLog {
  id: string;
  claim_id: string;
  user_id: string;
  action: string;
  timestamp: string;
}

export interface WorkspaceSettings {
  workspaceName: string;
  baseCurrency: string;
  approvalThreshold: number;
  autoSync: boolean;
  aiExtractionEnabled: boolean;
}

export interface WorkspaceData {
  entities: LegalEntity[];
  teams: Team[];
  users: User[];
  claims: Claim[];
  auditLogs: AuditLog[];
  settings: WorkspaceSettings;
}
