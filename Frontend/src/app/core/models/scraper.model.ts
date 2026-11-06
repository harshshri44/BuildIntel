export interface ScrapingRequestDTO {
  district?: string;
  districtCode?: string;
  pincode?: string;
  startPage?: number;
  maxPages?: number;
  maxRecords?: number;
  scrapeAll?: boolean;
  mode?: 'upsert' | 'new_only';
}

export interface ScrapingJobResponseDTO {
  jobId: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'STOPPED';
  district?: string;
  districtCode?: string;
  pincode?: string;
  mode: string;
  startPage: number;
  maxPages: number;
  maxRecords: number;
  scrapeAll: boolean;
  pagesProcessed: number;
  totalPages: number;
  recordsDiscovered: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsSkipped: number;
  recordsFailed: number;
  startTime?: string;
  endTime?: string;
  errorMessage?: string;
  logs: string[];
}

export interface DistrictOptionDTO {
  name: string;
  code: string;
  projectCount: number;
}

export interface DashboardStatsDTO {
  totalProjects: number;
  totalBuilders: number;
  completedJobsCount: number;
  activeJobsCount: number;
  lastScrapedAt?: string;
  recentJob?: ScrapingJobResponseDTO;
  topDistricts?: DistrictOptionDTO[];
}
