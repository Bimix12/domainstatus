export type DomainStatus = "Active" | "Inactive";

export interface DomainResult {
  domain: string;
  status: DomainStatus;
  description: string;
}
