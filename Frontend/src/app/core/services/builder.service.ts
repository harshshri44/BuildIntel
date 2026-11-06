import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/pagination.model';
import { BuilderDetailResponseDTO, BuilderResponseDTO } from '../models/builder.model';

@Injectable({
  providedIn: 'root',
})
export class BuilderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/builders`;

  /**
   * Retrieves paginated list of builders.
   */
  getAllBuilders(
    page: number = 0,
    size: number = 10,
    sort: string = 'id,asc'
  ): Observable<PaginatedResponse<BuilderResponseDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<PaginatedResponse<BuilderResponseDTO>>(this.baseUrl, { params });
  }

  /**
   * Retrieves builder details along with all associated projects.
   */
  getBuilderById(id: number): Observable<BuilderDetailResponseDTO> {
    return this.http.get<BuilderDetailResponseDTO>(`${this.baseUrl}/${id}`);
  }
}
