import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/pagination.model';
import {
  ScrapingRequestDTO,
  ScrapingJobResponseDTO,
  DashboardStatsDTO,
  DistrictOptionDTO,
} from '../models/scraper.model';

@Injectable({
  providedIn: 'root',
})
export class ScraperService {
  private readonly http = inject(HttpClient);
  private readonly scraperUrl = `${environment.apiUrl}/scraper`;
  private readonly dashboardUrl = `${environment.apiUrl}/dashboard`;
  private readonly exportUrl = `${environment.apiUrl}/export`;

  /**
   * Dispatches a new scraping job to the Spring Boot backend.
   */
  startJob(request: ScrapingRequestDTO): Observable<ScrapingJobResponseDTO> {
    return this.http.post<ScrapingJobResponseDTO>(`${this.scraperUrl}/start`, request);
  }

  /**
   * Retrieves status and live progress metrics for a job by ID.
   */
  getJobStatus(jobId: string): Observable<ScrapingJobResponseDTO> {
    return this.http.get<ScrapingJobResponseDTO>(`${this.scraperUrl}/status/${jobId}`);
  }

  /**
   * Checks if there is an in-flight job currently active (QUEUED or RUNNING).
   */
  getActiveJob(): Observable<ScrapingJobResponseDTO | null> {
    return this.http.get<ScrapingJobResponseDTO | null>(`${this.scraperUrl}/active`);
  }

  /**
   * Retrieves paginated history of scraping jobs.
   */
  getJobHistory(
    page: number = 0,
    size: number = 10
  ): Observable<PaginatedResponse<ScrapingJobResponseDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'createdAt,desc');

    return this.http.get<PaginatedResponse<ScrapingJobResponseDTO>>(`${this.scraperUrl}/jobs`, {
      params,
    });
  }

  /**
   * Requests cancellation of a running scraper process.
   */
  cancelJob(jobId: string): Observable<void> {
    return this.http.post<void>(`${this.scraperUrl}/cancel/${jobId}`, {});
  }

  /**
   * Retrieves verified Maharashtra districts with live database project counts.
   */
  getDistricts(): Observable<DistrictOptionDTO[]> {
    return this.http.get<DistrictOptionDTO[]>(`${this.scraperUrl}/districts`);
  }

  /**
   * Retrieves real-time aggregated dashboard intelligence metrics.
   */
  getDashboardStats(): Observable<DashboardStatsDTO> {
    return this.http.get<DashboardStatsDTO>(`${this.dashboardUrl}/stats`);
  }

  /**
   * Returns direct download URL for the Excel export endpoint.
   */
  getExcelDownloadUrl(): string {
    return `${this.exportUrl}/excel`;
  }
}
