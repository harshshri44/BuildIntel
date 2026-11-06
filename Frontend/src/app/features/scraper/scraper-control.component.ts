import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { ScraperService } from '../../core/services/scraper.service';
import {
  ScrapingRequestDTO,
  ScrapingJobResponseDTO,
  DistrictOptionDTO,
} from '../../core/models/scraper.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-scraper-control',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IconComponent,
    LoadingStateComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="scraper-page">
      <!-- Header Banner -->
      <div class="page-header-row">
        <div>
          <h2 class="page-title-main">Scraper Control</h2>
          <p class="page-subtitle">
            Configure and run scraping jobs to collect real-estate project records from MahaRERA.
          </p>
        </div>
        <div class="header-actions">
          <a routerLink="/projects" class="btn btn-secondary btn-sm">
            <app-icon name="projects" [size]="15"></app-icon>
            View Projects
          </a>
        </div>
      </div>

      <!-- Active Job Progress Monitor -->
      @if (activeJob()) {
        <div
          class="card job-monitor-card"
          [class.job-running]="activeJob()?.status === 'RUNNING'"
          [class.job-completed]="activeJob()?.status === 'COMPLETED'"
          [class.job-failed]="activeJob()?.status === 'FAILED'"
        >
          <div class="monitor-header">
            <div class="monitor-title-group">
              <div class="status-pill-lg" [ngClass]="getStatusClass(activeJob()?.status)">
                @if (activeJob()?.status === 'RUNNING') {
                  <span class="spinner-ring"></span>
                } @else if (activeJob()?.status === 'COMPLETED') {
                  <app-icon name="check-circle" [size]="16"></app-icon>
                } @else if (activeJob()?.status === 'FAILED') {
                  <app-icon name="alert-triangle" [size]="16"></app-icon>
                } @else {
                  <app-icon name="clock" [size]="16"></app-icon>
                }
                <span>{{ getStatusLabel(activeJob()?.status) }}</span>
              </div>
              <div>
                <h3 class="monitor-job-title">
                  {{ activeJob()?.district ? activeJob()?.district + ' District' : 'All Districts' }}
                </h3>
                <span class="job-id-mono">Job ID: {{ activeJob()?.jobId?.substring(0, 8) }}</span>
              </div>
            </div>

            <div class="monitor-actions">
              @if (activeJob()?.status === 'RUNNING' || activeJob()?.status === 'QUEUED') {
                <button
                  type="button"
                  class="btn btn-danger btn-sm"
                  (click)="cancelActiveJob()"
                  [disabled]="isCancelling()"
                >
                  <app-icon name="stop-circle" [size]="15"></app-icon>
                  {{ isCancelling() ? 'Stopping...' : 'Stop Scraping' }}
                </button>
              } @else {
                @if (activeJob()?.status === 'COMPLETED') {
                  <a
                    [routerLink]="['/projects']"
                    [queryParams]="activeJob()?.district ? { district: activeJob()?.district } : {}"
                    class="btn btn-primary btn-sm"
                  >
                    <app-icon name="projects" [size]="15"></app-icon>
                    View Collected Projects
                  </a>
                }
                <button
                  type="button"
                  class="btn btn-secondary btn-sm"
                  (click)="dismissActiveJobMonitor()"
                >
                  Close
                </button>
              }
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="progress-bar-wrap">
            <div class="progress-labels">
              <span class="progress-info-text">
                Page <strong>{{ activeJob()?.pagesProcessed }}</strong> of
                <strong>{{ activeJob()?.scrapeAll ? 'All' : activeJob()?.totalPages }}</strong>
              </span>
              <span class="progress-pct-text">{{ calculateProgressPct() }}%</span>
            </div>
            <div class="progress-track-lg">
              <div
                class="progress-fill-lg"
                [style.width.%]="calculateProgressPct()"
                [ngClass]="activeJob()?.status === 'FAILED' ? 'fill-failed' : (activeJob()?.status === 'COMPLETED' ? 'fill-completed' : 'fill-active')"
              ></div>
            </div>
          </div>

          <!-- Live Metrics Grid -->
          <div class="metrics-counters-grid">
            <div class="counter-box">
              <span class="counter-label">Projects Found</span>
              <span class="counter-value">{{ activeJob()?.recordsDiscovered }}</span>
              <span class="counter-sub">Scanned</span>
            </div>
            <div class="counter-box insert">
              <span class="counter-label">New Added</span>
              <span class="counter-value text-success">+{{ activeJob()?.recordsInserted }}</span>
              <span class="counter-sub">Saved</span>
            </div>
            <div class="counter-box update">
              <span class="counter-label">Updated</span>
              <span class="counter-value text-info">~{{ activeJob()?.recordsUpdated }}</span>
              <span class="counter-sub">Refreshed</span>
            </div>
            <div class="counter-box skip">
              <span class="counter-label">Skipped</span>
              <span class="counter-value text-muted">{{ activeJob()?.recordsSkipped }}</span>
              <span class="counter-sub">Unchanged</span>
            </div>
            <div class="counter-box error">
              <span class="counter-label">Errors</span>
              <span class="counter-value" [class.text-danger]="(activeJob()?.recordsFailed || 0) > 0">
                {{ activeJob()?.recordsFailed }}
              </span>
              <span class="counter-sub">Failed pages</span>
            </div>
          </div>

          <!-- Execution Timestamps -->
          <div class="job-meta-bar">
            <span><strong>Started:</strong> {{ formatDateTime(activeJob()?.startTime) }}</span>
            @if (activeJob()?.endTime) {
              <span><strong>Finished:</strong> {{ formatDateTime(activeJob()?.endTime) }}</span>
            }
            <span><strong>Mode:</strong> {{ activeJob()?.mode === 'new_only' ? 'Add New Only' : 'Update & Add New' }}</span>
            @if (activeJob()?.pincode) {
              <span><strong>Pincode:</strong> {{ activeJob()?.pincode }}</span>
            }
          </div>

          <!-- Error Alert Banner -->
          @if (activeJob()?.errorMessage) {
            <div class="alert alert-danger job-error-banner">
              <app-icon name="alert-triangle" [size]="18"></app-icon>
              <div>
                <strong>Notice:</strong> {{ activeJob()?.errorMessage }}
              </div>
            </div>
          }

          <!-- Live Activity Log -->
          <div class="activity-log-section">
            <div class="activity-header">
              <span class="activity-title">
                <app-icon name="terminal" [size]="14"></app-icon>
                Activity Log
              </span>
              <span class="activity-count">{{ activeJob()?.logs?.length || 0 }} updates</span>
            </div>
            <div class="activity-body">
              @if (!activeJob()?.logs || activeJob()?.logs?.length === 0) {
                <div class="log-line text-muted">Waiting for updates...</div>
              } @else {
                @for (log of activeJob()?.logs; track $index) {
                  <div
                    class="log-line"
                    [class.log-highlight]="log.includes('Page') && log.includes('processed')"
                    [class.log-error]="log.includes('Error') || log.includes('failed')"
                  >
                    <span class="log-bullet">•</span>
                    <span class="log-text">{{ cleanLogText(log) }}</span>
                  </div>
                }
              }
            </div>
          </div>
        </div>
      }

      <!-- Scraper Configuration Form & Summary Grid -->
      <div class="scraper-layout-grid">
        <!-- Configuration Card -->
        <div class="card config-card">
          <div class="card-header-styled">
            <div class="header-icon-wrap primary">
              <app-icon name="sliders" [size]="18"></app-icon>
            </div>
            <div>
              <h3 class="card-title">Scraper Setup</h3>
              <p class="card-subtitle">Choose filters and page limits to collect records</p>
            </div>
          </div>

          <form (ngSubmit)="openConfirmModal()" class="config-form">
            <!-- District Selection -->
            <div class="form-group">
              <label for="districtSelect" class="form-label">District</label>
              <select
                id="districtSelect"
                class="form-select"
                [(ngModel)]="selectedDistrict"
                name="selectedDistrict"
                (change)="onDistrictChange()"
              >
                <option value="">All Maharashtra Districts</option>
                @for (d of districts(); track d.name) {
                  <option [value]="d.name">
                    {{ d.name }} {{ d.projectCount > 0 ? '(' + d.projectCount + ' collected)' : '' }}
                  </option>
                }
              </select>
            </div>

            <!-- Pincode Input -->
            <div class="form-group">
              <label for="pincodeInput" class="form-label">Pincode (Optional)</label>
              <input
                id="pincodeInput"
                type="text"
                class="form-input"
                placeholder="e.g. 411001, 400001"
                maxlength="6"
                [(ngModel)]="pincode"
                name="pincode"
              />
              <span class="field-hint">Filter results by 6-digit postal code.</span>
            </div>

            <!-- Page Range Controls -->
            <div class="form-row-2">
              <div class="form-group">
                <label for="startPageInput" class="form-label">Start Page</label>
                <input
                  id="startPageInput"
                  type="number"
                  min="1"
                  max="4985"
                  class="form-input"
                  [(ngModel)]="startPage"
                  name="startPage"
                  [disabled]="isScrapingAll"
                />
              </div>

              <div class="form-group">
                <label for="maxPagesInput" class="form-label">Pages to Scrape</label>
                <input
                  id="maxPagesInput"
                  type="number"
                  min="1"
                  max="100"
                  class="form-input"
                  [(ngModel)]="maxPages"
                  name="maxPages"
                  [disabled]="isScrapingAll"
                />
                <span class="field-hint">10 projects per page</span>
              </div>
            </div>

            <!-- Scrape All Available Pages Toggle -->
            <div class="form-group">
              <label class="checkbox-container">
                <input
                  type="checkbox"
                  [(ngModel)]="isScrapingAll"
                  name="isScrapingAll"
                />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">
                  <strong>Scrape all available pages for this district</strong>
                  <span class="checkbox-desc">Collect all available pages up to 500 pages per job.</span>
                </span>
              </label>
            </div>

            <!-- Scraping Mode -->
            <div class="form-group">
              <label class="form-label">Scraping Mode</label>
              <div class="radio-options-grid">
                <label class="radio-card" [class.selected]="scrapingMode === 'upsert'">
                  <input
                    type="radio"
                    name="scrapingMode"
                    value="upsert"
                    [(ngModel)]="scrapingMode"
                  />
                  <div class="radio-content">
                    <div class="radio-title">Update existing & add new</div>
                    <div class="radio-desc">
                      Adds newly found projects and updates any changes to existing records.
                    </div>
                  </div>
                </label>

                <label class="radio-card" [class.selected]="scrapingMode === 'new_only'">
                  <input
                    type="radio"
                    name="scrapingMode"
                    value="new_only"
                    [(ngModel)]="scrapingMode"
                  />
                  <div class="radio-content">
                    <div class="radio-title">Add new projects only</div>
                    <div class="radio-desc">
                      Quickly adds new projects and skips records already in your database.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Optional Max Records Limit -->
            <div class="form-group">
              <label for="maxRecordsInput" class="form-label">
                Record Limit (Optional)
              </label>
              <input
                id="maxRecordsInput"
                type="number"
                min="0"
                class="form-input"
                placeholder="e.g. 50 (leave empty for no limit)"
                [(ngModel)]="maxRecords"
                name="maxRecords"
              />
            </div>

            <!-- Submit Button -->
            <div class="form-actions">
              <button
                type="submit"
                class="btn btn-primary btn-lg w-full"
                [disabled]="isSubmitting() || (activeJob() && (activeJob()?.status === 'RUNNING' || activeJob()?.status === 'QUEUED'))"
              >
                <app-icon name="play" [size]="18"></app-icon>
                <span>
                  {{ (activeJob() && (activeJob()?.status === 'RUNNING' || activeJob()?.status === 'QUEUED')) ? 'Scraping in progress...' : 'Start Scraping' }}
                </span>
              </button>
            </div>
          </form>
        </div>

        <!-- Summary & Quick Stats Column -->
        <div class="side-info-column">
          <!-- Database Summary Card -->
          <div class="card status-overview-card">
            <div class="card-header-sm">
              <span class="card-title-sm">Database Summary</span>
            </div>
            <div class="status-kpis">
              <div class="kpi-row">
                <span class="kpi-label">Total Projects</span>
                <span class="kpi-val">{{ totalProjects() }}</span>
              </div>
              <div class="kpi-row">
                <span class="kpi-label">Builders & Promoters</span>
                <span class="kpi-val">{{ totalBuilders() }}</span>
              </div>
              <div class="kpi-row">
                <span class="kpi-label">Scraping Jobs Run</span>
                <span class="kpi-val">{{ completedJobs() }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Tips Card -->
          <div class="card tips-card">
            <div class="card-header-sm">
              <app-icon name="info" [size]="16"></app-icon>
              <span class="card-title-sm">Quick Tips</span>
            </div>
            <ul class="tips-list">
              <li>Select a specific district to target local projects faster.</li>
              <li>You can leave the scraper running and explore projects at any time.</li>
              <li>Existing projects won't be duplicated when re-scraping the same pages.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Scraping Job History Section -->
      <div class="history-section">
        <div class="section-header-row">
          <div>
            <h3 class="section-title">Scraping History</h3>
            <p class="section-subtitle">Record of recent data collection runs</p>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" (click)="loadJobHistory()">
            <app-icon name="refresh" [size]="14"></app-icon>
            Refresh
          </button>
        </div>

        <div class="card history-card">
          @if (isLoadingHistory()) {
            <app-loading-state message="Loading history..."></app-loading-state>
          } @else if (jobHistory().length === 0) {
            <app-empty-state
              icon="history"
              title="No scraping jobs yet"
              description="Start a job above to collect MahaRERA project data."
            ></app-empty-state>
          } @else {
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>District</th>
                    <th>Status</th>
                    <th>Pages</th>
                    <th>Found</th>
                    <th>New</th>
                    <th>Updated</th>
                    <th>Skipped</th>
                    <th>Time</th>
                    <th class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  @for (job of jobHistory(); track job.jobId) {
                    <tr>
                      <td>
                        <strong>{{ job.district || 'All Districts' }}</strong>
                        @if (job.pincode) {
                          <span class="pincode-sub"> ({{ job.pincode }})</span>
                        }
                      </td>
                      <td>
                        <span class="badge" [ngClass]="getStatusBadgeClass(job.status)">
                          {{ getStatusLabel(job.status) }}
                        </span>
                      </td>
                      <td>
                        <span>{{ job.pagesProcessed }} / {{ job.scrapeAll ? 'All' : job.maxPages }}</span>
                      </td>
                      <td>{{ job.recordsDiscovered }}</td>
                      <td class="text-success font-semibold">+{{ job.recordsInserted }}</td>
                      <td class="text-info font-semibold">~{{ job.recordsUpdated }}</td>
                      <td class="text-muted">{{ job.recordsSkipped }}</td>
                      <td>
                        <span class="text-xs text-muted">{{ formatDateTime(job.startTime) }}</span>
                      </td>
                      <td class="text-right">
                        <button
                          type="button"
                          class="btn btn-ghost btn-sm"
                          (click)="inspectJob(job)"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>

      <!-- Confirmation Modal -->
      @if (showConfirmModal) {
        <div class="modal-backdrop" (click)="closeConfirmModal()">
          <div class="modal-dialog" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <app-icon name="alert-circle" [size]="20" extraClass="text-primary"></app-icon>
                <h3 class="modal-title">Confirm Scraping Job</h3>
              </div>
              <button
                type="button"
                class="btn btn-ghost btn-icon"
                (click)="closeConfirmModal()"
                aria-label="Close"
              >
                <app-icon name="x" [size]="16"></app-icon>
              </button>
            </div>

            <div class="modal-body">
              <p class="modal-intro">
                Review your scraping parameters before starting:
              </p>

              <div class="summary-table">
                <div class="summary-row">
                  <span class="s-label">District:</span>
                  <span class="s-val"><strong>{{ selectedDistrict ? selectedDistrict : 'All Districts' }}</strong></span>
                </div>
                @if (pincode) {
                  <div class="summary-row">
                    <span class="s-label">Pincode:</span>
                    <span class="s-val"><strong>{{ pincode }}</strong></span>
                  </div>
                }
                <div class="summary-row">
                  <span class="s-label">Pages:</span>
                  <span class="s-val">
                    {{ isScrapingAll ? 'All available pages' : 'Page ' + startPage + ' to ' + (startPage + maxPages - 1) + ' (' + maxPages + ' pages)' }}
                  </span>
                </div>
                <div class="summary-row">
                  <span class="s-label">Mode:</span>
                  <span class="s-val">{{ scrapingMode === 'new_only' ? 'Add new projects only' : 'Update existing & add new' }}</span>
                </div>
              </div>

              @if (isScrapingAll) {
                <div class="alert alert-warning mt-3">
                  <app-icon name="alert-triangle" [size]="16"></app-icon>
                  <span>
                    Scraping all pages may take several minutes. The job will run continuously in the background.
                  </span>
                </div>
              }
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeConfirmModal()">
                Cancel
              </button>
              <button
                type="button"
                class="btn btn-primary"
                (click)="confirmAndStartJob()"
                [disabled]="isSubmitting()"
              >
                <app-icon name="play" [size]="16"></app-icon>
                {{ isSubmitting() ? 'Starting...' : 'Start Scraping' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .scraper-page {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .page-header-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .page-title-main {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--text-main);
        letter-spacing: -0.02em;
      }

      .page-subtitle {
        font-size: 0.85rem;
        color: var(--text-muted);
        max-width: 650px;
        margin-top: 0.25rem;
        line-height: 1.45;
      }

      /* Job Monitor Card */
      .job-monitor-card {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        border-left: 4px solid var(--primary-600);
        background-color: var(--bg-surface);
      }

      .job-monitor-card.job-completed {
        border-left-color: #10b981;
      }

      .job-monitor-card.job-failed {
        border-left-color: #ef4444;
      }

      .monitor-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .monitor-title-group {
        display: flex;
        align-items: center;
        gap: 0.85rem;
      }

      .monitor-job-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text-main);
      }

      .job-id-mono {
        font-family: var(--font-mono);
        font-size: 0.75rem;
        color: var(--text-subtle);
      }

      .status-pill-lg {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.78rem;
        font-weight: 600;
        padding: 0.35rem 0.75rem;
        border-radius: var(--radius-full);
      }

      .status-pill-lg.status-running {
        background-color: #eff6ff;
        color: #1d4ed8;
        border: 1px solid #bfdbfe;
      }

      .status-pill-lg.status-completed {
        background-color: #ecfdf5;
        color: #047857;
        border: 1px solid #a7f3d0;
      }

      .status-pill-lg.status-failed {
        background-color: #fef2f2;
        color: #b91c1c;
        border: 1px solid #fecaca;
      }

      .status-pill-lg.status-queued {
        background-color: #fffbeb;
        color: #b45309;
        border: 1px solid #fde68a;
      }

      .spinner-ring {
        width: 12px;
        height: 12px;
        border: 2px solid #93c5fd;
        border-top-color: #1d4ed8;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .progress-bar-wrap {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .progress-labels {
        display: flex;
        justify-content: space-between;
        font-size: 0.82rem;
      }

      .progress-info-text {
        color: var(--text-muted);
      }

      .progress-pct-text {
        font-weight: 700;
        color: var(--primary-700);
      }

      .progress-track-lg {
        height: 8px;
        background-color: #e2e8f0;
        border-radius: var(--radius-full);
        overflow: hidden;
      }

      .progress-fill-lg {
        height: 100%;
        transition: width 0.4s ease;
      }

      .progress-fill-lg.fill-active {
        background-color: var(--primary-600);
      }

      .progress-fill-lg.fill-completed {
        background-color: #10b981;
      }

      .progress-fill-lg.fill-failed {
        background-color: #ef4444;
      }

      .metrics-counters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 0.85rem;
      }

      .counter-box {
        padding: 0.75rem 0.85rem;
        background-color: var(--bg-app);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        display: flex;
        flex-direction: column;
      }

      .counter-label {
        font-size: 0.72rem;
        font-weight: 600;
        color: var(--text-muted);
      }

      .counter-value {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--text-main);
        line-height: 1.2;
        margin-top: 0.15rem;
      }

      .counter-sub {
        font-size: 0.68rem;
        color: var(--text-subtle);
        margin-top: 0.15rem;
      }

      .job-meta-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        font-size: 0.78rem;
        color: var(--text-muted);
        padding: 0.5rem 0.75rem;
        background-color: var(--bg-subtle);
        border-radius: var(--radius-sm);
      }

      .job-error-banner {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      /* Activity Log */
      .activity-log-section {
        background-color: var(--bg-app);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        overflow: hidden;
      }

      .activity-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.55rem 0.85rem;
        background-color: var(--bg-subtle);
        border-bottom: 1px solid var(--border-color);
      }

      .activity-title {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-main);
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .activity-count {
        font-size: 0.7rem;
        color: var(--text-subtle);
      }

      .activity-body {
        padding: 0.75rem 0.85rem;
        max-height: 180px;
        overflow-y: auto;
        font-size: 0.78rem;
        line-height: 1.55;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .log-line {
        display: flex;
        gap: 0.5rem;
        color: var(--text-muted);
      }

      .log-bullet {
        color: var(--primary-600);
        user-select: none;
      }

      .log-text {
        word-break: break-word;
      }

      .log-line.log-highlight .log-text {
        color: var(--primary-700);
        font-weight: 600;
      }

      .log-line.log-error .log-text {
        color: #b91c1c;
      }

      /* Scraper Layout */
      .scraper-layout-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1.5rem;
      }

      @media (max-width: 960px) {
        .scraper-layout-grid {
          grid-template-columns: 1fr;
        }
      }

      .config-card {
        padding: 1.5rem;
      }

      .card-header-styled {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        margin-bottom: 1.25rem;
      }

      .header-icon-wrap {
        width: 38px;
        height: 38px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .header-icon-wrap.primary {
        background-color: var(--primary-50);
        color: var(--primary-600);
      }

      .config-form {
        display: flex;
        flex-direction: column;
        gap: 1.15rem;
      }

      .form-row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .field-hint {
        display: block;
        font-size: 0.72rem;
        color: var(--text-subtle);
        margin-top: 0.25rem;
      }

      /* Radio Cards */
      .radio-options-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }

      @media (max-width: 640px) {
        .radio-options-grid {
          grid-template-columns: 1fr;
        }
      }

      .radio-card {
        display: flex;
        align-items: flex-start;
        gap: 0.65rem;
        padding: 0.75rem 0.85rem;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-fast);
        background-color: var(--bg-surface);
      }

      .radio-card:hover {
        background-color: var(--bg-subtle);
      }

      .radio-card.selected {
        border-color: var(--primary-600);
        background-color: var(--primary-50);
      }

      .radio-title {
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--text-main);
      }

      .radio-desc {
        font-size: 0.72rem;
        color: var(--text-muted);
        margin-top: 0.2rem;
        line-height: 1.35;
      }

      /* Checkbox Container */
      .checkbox-container {
        display: flex;
        align-items: flex-start;
        gap: 0.65rem;
        cursor: pointer;
        padding: 0.65rem 0.85rem;
        background-color: var(--bg-subtle);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);
      }

      .checkbox-label {
        display: flex;
        flex-direction: column;
        font-size: 0.82rem;
        color: var(--text-main);
      }

      .checkbox-desc {
        font-size: 0.72rem;
        color: var(--text-muted);
        margin-top: 0.15rem;
      }

      /* Side Info Column */
      .side-info-column {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .status-overview-card,
      .tips-card {
        padding: 1.25rem;
      }

      .card-header-sm {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.85rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border-color);
      }

      .card-title-sm {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-main);
      }

      .status-kpis {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
      }

      .kpi-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.82rem;
      }

      .kpi-label {
        color: var(--text-muted);
      }

      .kpi-val {
        font-weight: 700;
        color: var(--text-main);
      }

      .tips-list {
        list-style: disc;
        padding-left: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        font-size: 0.78rem;
        color: var(--text-muted);
        line-height: 1.45;
      }

      /* History Section */
      .history-section {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        margin-top: 0.5rem;
      }

      .section-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .section-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-main);
      }

      .section-subtitle {
        font-size: 0.78rem;
        color: var(--text-muted);
      }

      .history-card {
        padding: 0;
        overflow: hidden;
      }

      /* Confirmation Modal */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background-color: rgba(15, 23, 42, 0.5);
        backdrop-filter: blur(2px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        padding: 1rem;
      }

      .modal-dialog {
        background-color: var(--bg-surface);
        border-radius: var(--radius-lg);
        width: 100%;
        max-width: 500px;
        box-shadow: var(--shadow-xl);
        overflow: hidden;
      }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.15rem 1.5rem;
        border-bottom: 1px solid var(--border-color);
      }

      .modal-title-wrap {
        display: flex;
        align-items: center;
        gap: 0.65rem;
      }

      .modal-title {
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-main);
      }

      .modal-body {
        padding: 1.5rem;
      }

      .modal-intro {
        font-size: 0.85rem;
        color: var(--text-muted);
        margin-bottom: 1rem;
      }

      .summary-table {
        background-color: var(--bg-subtle);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 0.85rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        gap: 1rem;
      }

      .s-label {
        color: var(--text-muted);
      }

      .s-val {
        color: var(--text-main);
        text-align: right;
      }

      .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--border-color);
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        background-color: var(--bg-app);
      }
    `,
  ],
})
export class ScraperControlComponent implements OnInit, OnDestroy {
  private readonly scraperService = inject(ScraperService);

  // Form parameters
  selectedDistrict: string = '';
  pincode: string = '';
  startPage: number = 1;
  maxPages: number = 1;
  maxRecords: number = 0;
  isScrapingAll: boolean = false;
  scrapingMode: 'upsert' | 'new_only' = 'upsert';

  // Signals for data state
  readonly districts = signal<DistrictOptionDTO[]>([]);
  readonly activeJob = signal<ScrapingJobResponseDTO | null>(null);
  readonly jobHistory = signal<ScrapingJobResponseDTO[]>([]);
  readonly isLoadingHistory = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly isCancelling = signal<boolean>(false);

  // Platform counters
  readonly totalProjects = signal<number>(0);
  readonly totalBuilders = signal<number>(0);
  readonly completedJobs = signal<number>(0);

  // Modal control
  showConfirmModal: boolean = false;

  private pollSubscription?: Subscription;

  ngOnInit() {
    this.loadDistricts();
    this.checkActiveJob();
    this.loadJobHistory();
    this.loadPlatformStats();
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  loadDistricts() {
    this.scraperService.getDistricts().subscribe({
      next: (data) => this.districts.set(data),
      error: (err) => console.error('Failed to load districts:', err),
    });
  }

  loadPlatformStats() {
    this.scraperService.getDashboardStats().subscribe({
      next: (stats) => {
        this.totalProjects.set(stats.totalProjects);
        this.totalBuilders.set(stats.totalBuilders);
        this.completedJobs.set(stats.completedJobsCount);
      },
      error: (err) => console.error('Failed to load platform stats:', err),
    });
  }

  checkActiveJob() {
    this.scraperService.getActiveJob().subscribe({
      next: (job) => {
        if (job) {
          this.activeJob.set(job);
          this.startPolling(job.jobId);
        }
      },
      error: (err) => console.error('Failed to check active job:', err),
    });
  }

  loadJobHistory() {
    this.isLoadingHistory.set(true);
    this.scraperService.getJobHistory(0, 10).subscribe({
      next: (res) => {
        this.jobHistory.set(res.content);
        this.isLoadingHistory.set(false);
      },
      error: (err) => {
        console.error('Failed to load job history:', err);
        this.isLoadingHistory.set(false);
      },
    });
  }

  onDistrictChange() {
    this.startPage = 1;
  }

  openConfirmModal() {
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
  }

  confirmAndStartJob() {
    this.isSubmitting.set(true);
    const req: ScrapingRequestDTO = {
      district: this.selectedDistrict || undefined,
      pincode: this.pincode.trim() || undefined,
      startPage: this.startPage,
      maxPages: this.maxPages,
      maxRecords: this.maxRecords > 0 ? this.maxRecords : 0,
      scrapeAll: this.isScrapingAll,
      mode: this.scrapingMode,
    };

    this.scraperService.startJob(req).subscribe({
      next: (job) => {
        this.activeJob.set(job);
        this.isSubmitting.set(false);
        this.closeConfirmModal();
        this.startPolling(job.jobId);
        this.loadJobHistory();
        this.loadPlatformStats();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const errorMsg = err?.error?.message || 'Failed to start scraping job.';
        alert('Error starting scraper: ' + errorMsg);
      },
    });
  }

  startPolling(jobId: string) {
    this.stopPolling();
    this.pollSubscription = interval(1500).subscribe(() => {
      this.scraperService.getJobStatus(jobId).subscribe({
        next: (job) => {
          this.activeJob.set(job);
          if (job.status === 'COMPLETED' || job.status === 'FAILED' || job.status === 'STOPPED') {
            this.stopPolling();
            this.loadJobHistory();
            this.loadPlatformStats();
          }
        },
        error: (err) => {
          console.error('Polling error:', err);
        },
      });
    });
  }

  stopPolling() {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      this.pollSubscription = undefined;
    }
  }

  cancelActiveJob() {
    const job = this.activeJob();
    if (!job) return;

    if (!confirm('Are you sure you want to stop this scraping job?')) {
      return;
    }

    this.isCancelling.set(true);
    this.scraperService.cancelJob(job.jobId).subscribe({
      next: () => {
        this.isCancelling.set(false);
        this.stopPolling();
        this.scraperService.getJobStatus(job.jobId).subscribe((updated) => {
          this.activeJob.set(updated);
          this.loadJobHistory();
          this.loadPlatformStats();
        });
      },
      error: (err) => {
        this.isCancelling.set(false);
        alert('Failed to stop job: ' + (err?.error?.message || err.message));
      },
    });
  }

  dismissActiveJobMonitor() {
    this.activeJob.set(null);
  }

  inspectJob(job: ScrapingJobResponseDTO) {
    this.scraperService.getJobStatus(job.jobId).subscribe({
      next: (fullJob) => {
        this.activeJob.set(fullJob);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => console.error('Could not fetch job details:', err),
    });
  }

  calculateProgressPct(): number {
    const job = this.activeJob();
    if (!job) return 0;
    if (job.status === 'COMPLETED') return 100;
    if (job.totalPages <= 0) {
      return job.pagesProcessed > 0 ? 50 : 5;
    }
    const pct = Math.round((job.pagesProcessed / job.totalPages) * 100);
    return Math.min(100, Math.max(0, pct));
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'RUNNING':
        return 'status-running';
      case 'COMPLETED':
        return 'status-completed';
      case 'FAILED':
        return 'status-failed';
      default:
        return 'status-queued';
    }
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'RUNNING':
        return 'badge-info';
      case 'COMPLETED':
        return 'badge-success';
      case 'FAILED':
        return 'badge-danger';
      case 'STOPPED':
        return 'badge-warning';
      default:
        return 'badge-neutral';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'RUNNING':
        return 'Running';
      case 'COMPLETED':
        return 'Completed';
      case 'FAILED':
        return 'Failed';
      case 'STOPPED':
        return 'Stopped';
      case 'QUEUED':
        return 'Queued';
      default:
        return status || 'Pending';
    }
  }

  cleanLogText(log: string): string {
    if (!log) return '';
    return log.replace(/^\[Scraper Error\]\s*/, '')
              .replace(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\s\[INFO\]\s*/, '')
              .replace(/^PROGRESS_JSON:\{.*\}\s*/, '');
  }

  formatDateTime(isoStr?: string): string {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
        ', ' + d.toLocaleDateString();
    } catch {
      return isoStr;
    }
  }
}
