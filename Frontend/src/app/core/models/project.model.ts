export interface ProjectResponseDTO {
  id: number;
  registrationNumber: string;
  projectName: string;
  builderId: number | null;
  builderName: string;
  state: string;
  district: string;
  pincode: string;
  locality: string;
  lastModifiedDate: string | null;
  registrationDate: string | null;
  projectStatus: string | null;
  detailsUrl: string | null;
  originalApplicationUrl: string | null;
  sourceName: string;
  scrapedAt: string | null;
}

export interface ProjectSummaryDTO {
  id: number;
  registrationNumber: string;
  projectName: string;
  district: string;
  locality: string;
  projectStatus: string | null;
  lastModifiedDate: string | null;
  detailsUrl: string | null;
}

export interface ProjectFilterParams {
  district?: string;
  pincode?: string;
}
