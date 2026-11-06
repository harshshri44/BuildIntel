import { ProjectSummaryDTO } from './project.model';

export interface BuilderResponseDTO {
  id: number;
  builderName: string;
  registrationNumber: string | null;
  address: string | null;
  projectCount: number;
}

export interface BuilderDetailResponseDTO {
  id: number;
  builderName: string;
  registrationNumber: string | null;
  address: string | null;
  projects: ProjectSummaryDTO[];
}
