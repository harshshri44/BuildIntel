import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { ProjectResponseDTO } from '../../../core/models/project.model';
import { PaginatedResponse } from '../../../core/models/pagination.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-project-list',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IconComponent,
    PaginationComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="projects-page">
      <!-- Page Header -->
      <div class="page-header-row">
        <div>
          <h2 class="page-title-main">MahaRERA Projects Directory</h2>
          <p class="page-subtitle">
            Search, filter, and inspect verified real-estate developments across Maharashtra.
          </p>
        </div>
        <div class="header-actions">
          <a routerLink="/scraper" class="btn btn-primary btn-sm">
            <app-icon name="play" [size]="14"></app-icon>
            Scrape More Records
          </a>
          <button type="button" class="btn btn-secondary btn-sm" (click)="loadProjects()">
            <app-icon name="refresh" [size]="14"></app-icon>
            Refresh
          </button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="card filter-card">
        <form (ngSubmit)="applyFilters()" class="filter-form">
          <div class="filter-controls-grid">
            <!-- Search Keyword -->
            <div class="form-group flex-2">
              <label for="searchKeyword" class="form-label">Search Keyword / Reg No</label>
              <div class="search-input-wrap">
                <app-icon name="search" [size]="16" extraClass="search-icon"></app-icon>
                <input
                  id="searchKeyword"
                  type="text"
                  class="form-input search-input"
                  placeholder="e.g. Green City, P50500000005..."
                  [(ngModel)]="searchKeyword"
                  name="searchKeyword"
                />
                @if (searchKeyword) {
                  <button
                    type="button"
                    class="btn btn-ghost btn-icon clear-btn"
                    (click)="searchKeyword = ''; applyFilters()"
                    aria-label="Clear search keyword"
                  >
                    <app-icon name="x" [size]="14"></app-icon>
                  </button>
                }
              </div>
            </div>

            <!-- District Filter -->
            <div class="form-group flex-1">
              <label for="districtInput" class="form-label">District</label>
              <input
                id="districtInput"
                type="text"
                class="form-input"
                placeholder="e.g. Nagpur, Thane, Pune"
                [(ngModel)]="filterDistrict"
                name="filterDistrict"
              />
            </div>

            <!-- Pincode Filter -->
            <div class="form-group flex-1">
              <label for="pincodeInput" class="form-label">Pincode</label>
              <input
                id="pincodeInput"
                type="text"
                class="form-input"
                placeholder="e.g. 441108"
                [(ngModel)]="filterPincode"
                name="filterPincode"
              />
            </div>

            <!-- Filter Buttons -->
            <div class="form-actions-cell">
              <button type="submit" class="btn btn-primary">
                <app-icon name="filter" [size]="14"></app-icon>
                Filter
              </button>
              @if (isFiltered()) {
                <button
                  type="button"
                  class="btn btn-secondary"
                  (click)="resetFilters()"
                  title="Reset all filters"
                >
                  <app-icon name="x" [size]="14"></app-icon>
                  Reset
                </button>
              }
            </div>
          </div>
        </form>
      </div>

      <!-- Active Filter Chips -->
      @if (isFiltered()) {
        <div class="active-filters-row">
          <span class="active-filter-label">Active Filters:</span>
          @if (activeSearch()) {
            <span class="badge badge-info">
              Keyword: "{{ activeSearch() }}"
              <button
                type="button"
                class="chip-clear"
                (click)="searchKeyword = ''; applyFilters()"
                aria-label="Remove keyword filter"
              >
                ×
              </button>
            </span>
          }
          @if (activeDistrict()) {
            <span class="badge badge-info">
              District: {{ activeDistrict() }}
              <button
                type="button"
                class="chip-clear"
                (click)="filterDistrict = ''; applyFilters()"
                aria-label="Remove district filter"
              >
                ×
              </button>
            </span>
          }
          @if (activePincode()) {
            <span class="badge badge-info">
              Pincode: {{ activePincode() }}
              <button
                type="button"
                class="chip-clear"
                (click)="filterPincode = ''; applyFilters()"
                aria-label="Remove pincode filter"
              >
                ×
              </button>
            </span>
          }
        </div>
      }

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="card">
          <app-loading-state message="Loading projects from database..."></app-loading-state>
        </div>
      }

      <!-- Error State -->
      @else if (errorMessage()) {
        <app-error-state
          title="Error Loading Projects"
          [message]="errorMessage()!"
          (retry)="loadProjects()"
        ></app-error-state>
      }

      <!-- Empty State -->
      @else if (projects().length === 0) {
        <div class="card">
          <app-empty-state
            icon="search"
            title="No matching projects found"
            description="No real-estate projects matched your filter criteria. Try searching with a different keyword, district, or pincode."
            actionLabel="Reset All Filters"
            (action)="resetFilters()"
          ></app-empty-state>
        </div>
      }

      <!-- Projects Data Table -->
      @else {
        <div class="results-summary-row">
          <div class="results-count-text">
            Showing <strong>{{ totalElements() }}</strong> registered projects
          </div>
          <div class="results-actions">
            <a routerLink="/export" class="btn btn-ghost btn-sm">
              <app-icon name="download" [size]="14"></app-icon>
              Export to Excel
            </a>
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Registration No</th>
                <th>Project Name</th>
                <th>Promoter / Builder</th>
                <th>District & Locality</th>
                <th>Pincode</th>
                <th>Last Modified</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (proj of projects(); track proj.id) {
                <tr>
                  <!-- Reg Number -->
                  <td>
                    <div class="reg-number-wrap">
                      <span class="badge badge-neutral badge-mono">
                        {{ proj.registrationNumber }}
                      </span>
                    </div>
                  </td>

                  <!-- Project Name -->
                  <td>
                    <div class="project-name-cell">
                      <a [routerLink]="['/projects', proj.id]" class="proj-title-link">
                        {{ proj.projectName }}
                      </a>
                      <span class="status-indicator">
                        <span class="status-dot"></span>
                        Registered (MahaRERA)
                      </span>
                    </div>
                  </td>

                  <!-- Builder -->
                  <td>
                    @if (proj.builderId) {
                      <a
                        [routerLink]="['/builders', proj.builderId]"
                        class="builder-link"
                        title="View promoter profile"
                      >
                        {{ proj.builderName }}
                      </a>
                    } @else {
                      <span class="text-muted">{{ proj.builderName || '—' }}</span>
                    }
                  </td>

                  <!-- District & Locality -->
                  <td>
                    <div class="district-locality-cell">
                      <span class="district-text">{{ proj.district }}</span>
                      @if (proj.locality) {
                        <span class="locality-text">{{ proj.locality }}</span>
                      }
                    </div>
                  </td>

                  <!-- Pincode -->
                  <td>
                    <span class="mono-text">{{ proj.pincode || '—' }}</span>
                  </td>

                  <!-- Last Modified Date -->
                  <td>
                    <span class="date-text">
                      {{ proj.lastModifiedDate ? proj.lastModifiedDate : '—' }}
                    </span>
                  </td>

                  <!-- Actions -->
                  <td class="text-right">
                    <div class="table-actions">
                      <a
                        [routerLink]="['/projects', proj.id]"
                        class="btn btn-secondary btn-sm"
                        title="View comprehensive project intelligence"
                      >
                        Details
                      </a>
                      @if (proj.detailsUrl) {
                        <a
                          [href]="proj.detailsUrl"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="btn btn-ghost btn-sm btn-icon"
                          title="Open official MahaRERA public record"
                        >
                          <app-icon name="external-link" [size]="14"></app-icon>
                        </a>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Pagination Bar -->
          <app-pagination
            [pageNumber]="pageNumber()"
            [pageSize]="pageSize()"
            [totalElements]="totalElements()"
            [totalPages]="totalPages()"
            [isLast]="isLast()"
            (pageChange)="onPageChange($event)"
            (pageSizeChange)="onPageSizeChange($event)"
          ></app-pagination>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .projects-page {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .page-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .page-title-main {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-main);
      }

      .page-subtitle {
        font-size: 0.85rem;
        color: var(--text-muted);
        margin-top: 0.15rem;
      }

      .results-summary-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.35rem 0.5rem;
        font-size: 0.82rem;
        color: var(--text-muted);
      }

      .results-count-text strong {
        color: var(--text-main);
      }

      .results-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* Filter Toolbar */
      .filter-card {
        padding: 1.25rem;
      }

      .filter-controls-grid {
        display: flex;
        align-items: flex-end;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .flex-2 {
        flex: 2;
        min-width: 240px;
      }

      .flex-1 {
        flex: 1;
        min-width: 160px;
      }

      .search-input-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }

      .search-icon {
        position: absolute;
        left: 0.75rem;
        color: var(--text-subtle);
        pointer-events: none;
      }

      .search-input {
        width: 100%;
        padding-left: 2.25rem;
        padding-right: 2rem;
      }

      .clear-btn {
        position: absolute;
        right: 0.35rem;
        padding: 0.25rem;
        height: auto;
      }

      .form-actions-cell {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        height: 38px;
      }

      /* Active Filters */
      .active-filters-row {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        flex-wrap: wrap;
        font-size: 0.825rem;
      }

      .active-filter-label {
        font-weight: 600;
        color: var(--text-muted);
      }

      .chip-clear {
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 1rem;
        line-height: 1;
        color: inherit;
        padding: 0 0.15rem;
        margin-left: 0.25rem;
      }

      /* Table Styles */
      .reg-number-wrap {
        display: flex;
        align-items: center;
      }

      .project-name-cell {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }

      .proj-title-link {
        font-weight: 600;
        color: var(--text-main);
        font-size: 0.9rem;
      }

      .proj-title-link:hover {
        color: var(--primary-600);
      }

      .status-indicator {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.72rem;
        color: var(--badge-success-text);
        font-weight: 500;
      }

      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #10b981;
      }

      .builder-link {
        color: var(--text-main);
        font-weight: 500;
      }

      .builder-link:hover {
        color: var(--primary-600);
      }

      .district-locality-cell {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }

      .district-text {
        font-weight: 500;
      }

      .locality-text {
        font-size: 0.75rem;
        color: var(--text-subtle);
      }

      .mono-text {
        font-family: var(--font-mono);
        font-size: 0.825rem;
        color: var(--text-muted);
      }

      .date-text {
        font-family: var(--font-mono);
        font-size: 0.8rem;
        color: var(--text-muted);
      }

      .table-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.4rem;
      }

      .text-right {
        text-align: right;
      }

      @media (max-width: 768px) {
        .filter-controls-grid {
          flex-direction: column;
          align-items: stretch;
        }
        .form-actions-cell {
          margin-top: 0.5rem;
        }
      }
    `,
  ],
})
export class ProjectListComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Form Model
  searchKeyword: string = '';
  filterDistrict: string = '';
  filterPincode: string = '';

  // Active Filter state
  readonly activeSearch = signal<string>('');
  readonly activeDistrict = signal<string>('');
  readonly activePincode = signal<string>('');

  // Table Data & Pagination Signals
  readonly projects = signal<ProjectResponseDTO[]>([]);
  readonly pageNumber = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly totalElements = signal<number>(0);
  readonly totalPages = signal<number>(0);
  readonly isLast = signal<boolean>(false);

  // Status Signals
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit() {
    // Read optional query params (e.g. from Dashboard click)
    this.route.queryParams.subscribe((params) => {
      if (params['district']) {
        this.filterDistrict = params['district'];
        this.activeDistrict.set(params['district']);
      }
      if (params['pincode']) {
        this.filterPincode = params['pincode'];
        this.activePincode.set(params['pincode']);
      }
      if (params['keyword']) {
        this.searchKeyword = params['keyword'];
        this.activeSearch.set(params['keyword']);
      }
      this.loadProjects();
    });
  }

  isFiltered(): boolean {
    return !!(this.activeSearch() || this.activeDistrict() || this.activePincode());
  }

  applyFilters() {
    this.activeSearch.set(this.searchKeyword.trim());
    this.activeDistrict.set(this.filterDistrict.trim());
    this.activePincode.set(this.filterPincode.trim());
    this.pageNumber.set(0);

    // Sync with router query params
    const queryParams: Record<string, string | null> = {
      keyword: this.activeSearch() || null,
      district: this.activeDistrict() || null,
      pincode: this.activePincode() || null,
    };
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
    this.loadProjects();
  }

  resetFilters() {
    this.searchKeyword = '';
    this.filterDistrict = '';
    this.filterPincode = '';
    this.activeSearch.set('');
    this.activeDistrict.set('');
    this.activePincode.set('');
    this.pageNumber.set(0);

    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
    this.loadProjects();
  }

  onPageChange(page: number) {
    this.pageNumber.set(page);
    this.loadProjects();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.pageNumber.set(0);
    this.loadProjects();
  }

  loadProjects() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const page = this.pageNumber();
    const size = this.pageSize();
    const keyword = this.activeSearch();
    const district = this.activeDistrict();
    const pincode = this.activePincode();

    let request$;

    if (keyword) {
      // Use search endpoint
      request$ = this.projectService.searchProjects(keyword, page, size);
    } else if (district || pincode) {
      // Use filter endpoint
      request$ = this.projectService.filterProjects(district, pincode, page, size);
    } else {
      // Use default list endpoint
      request$ = this.projectService.getAllProjects(page, size);
    }

    request$.subscribe({
      next: (res: PaginatedResponse<ProjectResponseDTO>) => {
        this.projects.set(res.content);
        this.pageNumber.set(res.pageNumber);
        this.pageSize.set(res.pageSize);
        this.totalElements.set(res.totalElements);
        this.totalPages.set(res.totalPages);
        this.isLast.set(res.last);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching projects:', err);
        const msg =
          err?.error?.message ||
          'Failed to retrieve projects from the server. Check if the backend is reachable.';
        this.errorMessage.set(msg);
        this.isLoading.set(false);
      },
    });
  }
}
