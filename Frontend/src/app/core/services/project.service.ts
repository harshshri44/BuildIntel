import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/pagination.model';
import { ProjectResponseDTO } from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/projects`;

  /**
   * Retrieves paginated projects.
   */
  getAllProjects(
    page: number = 0,
    size: number = 10,
    sort: string = 'id,asc'
  ): Observable<PaginatedResponse<ProjectResponseDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<PaginatedResponse<ProjectResponseDTO>>(this.baseUrl, { params });
  }

  /**
   * Retrieves a single project by ID.
   */
  getProjectById(id: number): Observable<ProjectResponseDTO> {
    return this.http.get<ProjectResponseDTO>(`${this.baseUrl}/${id}`);
  }

  /**
   * Searches projects by keyword matching project name or registration number.
   */
  searchProjects(
    keyword: string,
    page: number = 0,
    size: number = 10,
    sort: string = 'id,asc'
  ): Observable<PaginatedResponse<ProjectResponseDTO>> {
    let params = new HttpParams()
      .set('keyword', keyword.trim())
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<PaginatedResponse<ProjectResponseDTO>>(`${this.baseUrl}/search`, { params });
  }

  /**
   * Filters projects by district, pincode, or both.
   */
  filterProjects(
    district?: string,
    pincode?: string,
    page: number = 0,
    size: number = 10,
    sort: string = 'id,asc'
  ): Observable<PaginatedResponse<ProjectResponseDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (district && district.trim()) {
      params = params.set('district', district.trim());
    }

    if (pincode && pincode.trim()) {
      params = params.set('pincode', pincode.trim());
    }

    return this.http.get<PaginatedResponse<ProjectResponseDTO>>(`${this.baseUrl}/filter`, { params });
  }

  /**
   * Retrieves projects associated with a specific builder.
   */
  getProjectsByBuilder(
    builderId: number,
    page: number = 0,
    size: number = 10,
    sort: string = 'id,asc'
  ): Observable<PaginatedResponse<ProjectResponseDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<PaginatedResponse<ProjectResponseDTO>>(`${this.baseUrl}/builder/${builderId}`, { params });
  }
}
