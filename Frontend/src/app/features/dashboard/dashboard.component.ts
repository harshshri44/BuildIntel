import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProjectService } from '../../core/services/project.service';
import { ScraperService } from '../../core/services/scraper.service';
import { ProjectResponseDTO } from '../../core/models/project.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

interface DistrictSummary {
  district: string;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    IconComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="dashboard-page">
      <!-- Page Sub-Header -->
      <div class="page-intro">
        <div>
          <h2 class="section-heading">MahaRERA Project Intelligence</h2>
          <p class="section-description">
            Collect, track, and explore real-estate project filings across Maharashtra.
          </p>
        </div>
        <div class="header-cta-group">
          <a routerLink="/scraper" class="btn btn-primary btn-sm">
            <app-icon name="play" [size]="14"></app-icon>
            Start Scraping
          </a>
          <button type="button" class="btn btn-secondary btn-sm" (click)="loadDashboardData()">
            <app-icon name="refresh" [size]="14"></app-icon>
            Refresh
          </button>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <app-loading-state message="Loading project metrics..."></app-loading-state>
      }

      <!-- Error State -->
      @else if (errorMessage()) {
        <app-error-state
          title="Unable to load dashboard data"
          [message]="errorMessage()!"
          (retry)="loadDashboardData()"
        ></app-error-state>
      }

      <!-- Main Content -->
      @else {
        <!-- Key Metrics Cards -->
        <div class="metrics-grid">
          <div class="card metric-card">
            <div class="metric-icon-wrap primary">
              <app-icon name="projects" [size]="20"></app-icon>
            </div>
            <div class="metric-details">
              <span class="metric-label">Total Projects</span>
              <span class="metric-value">{{ totalProjects() }}</span>
              <span class="metric-footnote">Collected in database</span>
            </div>
          </div>

          <div class="card metric-card">
            <div class="metric-icon-wrap info">
              <app-icon name="building" [size]="20"></app-icon>
            </div>
            <div class="metric-details">
              <span class="metric-label">Builders & Promoters</span>
              <span class="metric-value">{{ totalBuilders() }}</span>
              <span class="metric-footnote">Registered developers</span>
            </div>
          </div>

          <div class="card metric-card">
            <div class="metric-icon-wrap success">
              <app-icon name="cpu" [size]="20"></app-icon>
            </div>
            <div class="metric-details">
              <span class="metric-label">Scraping Jobs Run</span>
              <span class="metric-value">{{ completedJobsCount() }}</span>
              <span class="metric-footnote">Completed data runs</span>
            </div>
          </div>

          <div class="card metric-card">
            <div class="metric-icon-wrap warning">
              <app-icon name="map-pin" [size]="20"></app-icon>
            </div>
            <div class="metric-details">
              <span class="metric-label">Districts Covered</span>
              <span class="metric-value">{{ coveredDistrictsCount() }}</span>
              <span class="metric-footnote">Districts with data</span>
            </div>
          </div>
        </div>

        <!-- Most Recent Scraping Job Banner -->
        @if (recentJob()) {
          <div class="card recent-job-banner">
            <div class="job-banner-icon">
              <app-icon name="clock" [size]="18" extraClass="text-primary"></app-icon>
            </div>
            <div class="job-banner-content">
              <div class="job-banner-title">
                <span>Recent Job:</span>
                <span class="badge" [ngClass]="getJobBadgeClass(recentJob()?.status)">
                  {{ recentJob()?.status === 'COMPLETED' ? 'Completed' : recentJob()?.status }}
                </span>
                <span class="job-banner-district">
                  {{ recentJob()?.district ? recentJob()?.district + ' District' : 'All Districts' }}
                </span>
              </div>
              <div class="job-banner-meta">
                <span>Found {{ recentJob()?.recordsDiscovered }} filings</span>
                <span class="text-success font-semibold">+{{ recentJob()?.recordsInserted }} new</span>
                @if (recentJob()?.recordsUpdated > 0) {
                  <span class="text-info font-semibold">~{{ recentJob()?.recordsUpdated }} updated</span>
                }
                <span>{{ formatDateTime(recentJob()?.startTime) }}</span>
              </div>
            </div>
            <div class="job-banner-action">
              <a routerLink="/scraper" class="btn btn-secondary btn-sm">
                Open Scraper
                <app-icon name="chevron-right" [size]="14"></app-icon>
              </a>
            </div>
          </div>
        }

        <!-- 2-Column Section: District Distribution & Recent Projects -->
        <div class="dashboard-grid">
          <!-- District Summary Card -->
          <div class="card district-card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Projects by District</h3>
                <p class="card-subtitle">Distribution across Maharashtra</p>
              </div>
            </div>
            <div class="card-body">
              @if (districtSummaries().length === 0) {
                <app-empty-state
                  icon="map-pin"
                  title="No district records"
                  description="Run a scraping job to collect project records."
                ></app-empty-state>
              } @else {
                <div class="district-list">
                  @for (dist of districtSummaries(); track dist.district) {
                    <div class="district-item">
                      <div class="district-info">
                        <div class="district-name-row">
                          <span class="district-name">{{ dist.district }}</span>
                          <span class="district-count">
                            {{ dist.count }} {{ dist.count === 1 ? 'project' : 'projects' }}
                            <span class="district-pct">({{ dist.percentage }}%)</span>
                          </span>
                        </div>
                        <div class="progress-track">
                          <div class="progress-fill" [style.width.%]="dist.percentage"></div>
                        </div>
                      </div>
                      <a
                        [routerLink]="['/projects']"
                        [queryParams]="{ district: dist.district }"
                        class="btn btn-ghost btn-sm btn-icon"
                        title="View projects in {{ dist.district }}"
                      >
                        <app-icon name="chevron-right" [size]="14"></app-icon>
                      </a>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Recent Projects Card -->
          <div class="card recent-projects-card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Recent Projects</h3>
                <p class="card-subtitle">Latest records collected in the database</p>
              </div>
              <a routerLink="/projects" class="btn btn-secondary btn-sm">
                View All
                <app-icon name="chevron-right" [size]="14"></app-icon>
              </a>
            </div>

            <div class="card-body p-0">
              @if (recentProjects().length === 0) {
                <app-empty-state
                  icon="projects"
                  title="No projects found"
                  description="Start a scraping job to collect projects."
                ></app-empty-state>
              } @else {
                <div class="table-container-embedded">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Project & Builder</th>
                        <th>Reg No</th>
                        <th>Location</th>
                        <th class="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (proj of recentProjects(); track proj.id) {
                        <tr>
                          <td>
                            <div class="proj-title-cell">
                              <a [routerLink]="['/projects', proj.id]" class="proj-link">
                                {{ proj.projectName }}
                              </a>
                              <span class="builder-subtext">{{ proj.builderName }}</span>
                            </div>
                          </td>
                          <td>
                            <span class="badge badge-neutral badge-mono">
                              {{ proj.registrationNumber }}
                            </span>
                          </td>
                          <td>
                            <div class="location-cell">
                              <span class="district-badge">{{ proj.district }}</span>
                              @if (proj.pincode) {
                                <span class="pincode-sub">{{ proj.pincode }}</span>
                              }
                            </div>
                          </td>
                          <td class="text-right">
                            <a
                              [routerLink]="['/projects', proj.id]"
                              class="btn btn-ghost btn-sm"
                            >
                              Details
                            </a>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .dashboard-page {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .page-intro {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .section-heading {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--text-main);
        letter-spacing: -0.02em;
      }

      .section-description {
        font-size: 0.85rem;
        color: var(--text-muted);
        margin-top: 0.2rem;
      }

      .header-cta-group {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      /* Metrics Grid */
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .metric-card {
        padding: 1.15rem;
        display: flex;
        align-items: flex-start;
        gap: 0.85rem;
      }

      .metric-icon-wrap {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .metric-icon-wrap.primary {
        background-color: var(--primary-50);
        color: var(--primary-600);
      }

      .metric-icon-wrap.info {
        background-color: #f0fdf4;
        color: #16a34a;
      }

      .metric-icon-wrap.success {
        background-color: #f5f3ff;
        color: #7c3aed;
      }

      .metric-icon-wrap.warning {
        background-color: #fffbeb;
        color: #d97706;
      }

      .metric-details {
        display: flex;
        flex-direction: column;
      }

      .metric-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted);
      }

      .metric-value {
        font-size: 1.6rem;
        font-weight: 700;
        color: var(--text-main);
        line-height: 1.2;
        margin: 0.15rem 0;
      }

      .metric-footnote {
        font-size: 0.72rem;
        color: var(--text-subtle);
      }

      /* Recent Job Banner */
      .recent-job-banner {
        padding: 0.85rem 1.15rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        background-color: var(--bg-surface);
        border-left: 3px solid var(--primary-600);
      }

      .job-banner-icon {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-md);
        background-color: var(--primary-50);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .job-banner-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }

      .job-banner-title {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-main);
      }

      .job-banner-district {
        color: var(--text-muted);
        font-weight: 500;
      }

      .job-banner-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      .job-banner-action {
        flex-shrink: 0;
      }

      /* Dashboard Grid */
      .dashboard-grid {
        display: grid;
        grid-template-columns: 1fr 1.6fr;
        gap: 1.25rem;
      }

      @media (max-width: 1024px) {
        .dashboard-grid {
          grid-template-columns: 1fr;
        }
      }

      .card-header {
        padding: 1rem 1.25rem;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .card-title {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-main);
      }

      .card-subtitle {
        font-size: 0.72rem;
        color: var(--text-subtle);
        margin-top: 0.1rem;
      }

      .card-body {
        padding: 1.25rem;
      }

      .p-0 {
        padding: 0;
      }

      /* District List */
      .district-list {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      .district-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .district-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .district-name-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
      }

      .district-name {
        font-weight: 600;
        color: var(--text-main);
      }

      .district-count {
        color: var(--text-muted);
      }

      .district-pct {
        font-size: 0.72rem;
        color: var(--text-subtle);
      }

      .progress-track {
        height: 6px;
        background-color: var(--bg-subtle);
        border-radius: var(--radius-full);
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background-color: var(--primary-600);
        border-radius: var(--radius-full);
      }

      /* Embedded Data Table */
      .table-container-embedded {
        overflow-x: auto;
      }

      .proj-title-cell {
        display: flex;
        flex-direction: column;
      }

      .proj-link {
        font-weight: 600;
        color: var(--text-main);
        text-decoration: none;
      }

      .proj-link:hover {
        color: var(--primary-600);
      }

      .builder-subtext {
        font-size: 0.72rem;
        color: var(--text-subtle);
      }

      .location-cell {
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
      }

      .district-badge {
        font-weight: 500;
        color: var(--text-main);
      }

      .pincode-sub {
        font-size: 0.7rem;
        color: var(--text-subtle);
        font-family: var(--font-mono);
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly scraperService = inject(ScraperService);

  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  readonly totalProjects = signal<number>(0);
  readonly totalBuilders = signal<number>(0);
  readonly completedJobsCount = signal<number>(0);
  readonly coveredDistrictsCount = signal<number>(0);
  readonly recentJob = signal<any>(null);
  readonly recentProjects = signal<ProjectResponseDTO[]>([]);
  readonly districtSummaries = signal<DistrictSummary[]>([]);

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      stats: this.scraperService.getDashboardStats(),
      districts: this.scraperService.getDistricts(),
      recentProjects: this.projectService.getAllProjects(0, 6, 'id,desc'),
    }).subscribe({
      next: ({ stats, districts, recentProjects }) => {
        this.totalProjects.set(stats.totalProjects);
        this.totalBuilders.set(stats.totalBuilders);
        this.completedJobsCount.set(stats.completedJobsCount);
        this.recentJob.set(stats.recentJob);
        this.recentProjects.set(recentProjects.content);

        const activeDistricts = districts.filter((d) => d.projectCount > 0);
        this.coveredDistrictsCount.set(activeDistricts.length);

        const total = stats.totalProjects;
        const summaries: DistrictSummary[] = activeDistricts.map((d) => ({
          district: d.name,
          count: d.projectCount,
          percentage: total > 0 ? Math.round((d.projectCount / total) * 100) : 0,
        }));
        this.districtSummaries.set(summaries);

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load dashboard data:', err);
        const msg =
          err?.error?.message ||
          'Could not connect to the backend API. Please verify the service is running.';
        this.errorMessage.set(msg);
        this.isLoading.set(false);
      },
    });
  }

  getJobBadgeClass(status?: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'badge-success';
      case 'RUNNING':
        return 'badge-info';
      case 'FAILED':
        return 'badge-danger';
      default:
        return 'badge-neutral';
    }
  }

  formatDateTime(isoStr?: string): string {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString();
    } catch {
      return isoStr;
    }
  }
}
