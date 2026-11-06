import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { ProjectResponseDTO } from '../../../core/models/project.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-project-detail',
  imports: [
    CommonModule,
    RouterLink,
    IconComponent,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  template: `
    <div class="project-detail-page">
      <!-- Top Action Navigation -->
      <div class="detail-top-nav">
        <a routerLink="/projects" class="btn btn-secondary btn-sm">
          <app-icon name="arrow-left" [size]="14"></app-icon>
          Back to Projects
        </a>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="card">
          <app-loading-state message="Retrieving full project intelligence record..."></app-loading-state>
        </div>
      }

      <!-- Error State -->
      @else if (errorMessage()) {
        <app-error-state
          title="Project Record Not Found"
          [message]="errorMessage()!"
          (retry)="loadProject()"
        ></app-error-state>
      }

      <!-- Project Record Content -->
      @else if (project(); as p) {
        <!-- Hero Header Card -->
        <div class="card hero-card">
          <div class="hero-main">
            <div class="hero-titles">
              <div class="reg-badge-row">
                <span class="badge badge-info badge-mono">
                  MahaRERA: {{ p.registrationNumber }}
                </span>
                <span class="badge badge-success">
                  <span class="dot"></span>
                  {{ p.projectStatus || 'Registered' }}
                </span>
              </div>
              <h2 class="hero-project-name">{{ p.projectName }}</h2>
              <p class="hero-location">
                <app-icon name="map-pin" [size]="14"></app-icon>
                {{ p.locality ? p.locality + ', ' : '' }}{{ p.district }}, {{ p.state }}
                @if (p.pincode) {
                  • <span>PIN: {{ p.pincode }}</span>
                }
              </p>
            </div>

            <div class="hero-actions">
              @if (p.detailsUrl) {
                <a
                  [href]="p.detailsUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-primary btn-sm"
                >
                  <app-icon name="external-link" [size]="14"></app-icon>
                  MahaRERA Record
                </a>
              }
              @if (p.originalApplicationUrl) {
                <a
                  [href]="p.originalApplicationUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-secondary btn-sm"
                >
                  <app-icon name="external-link" [size]="14"></app-icon>
                  Original Filing
                </a>
              }
            </div>
          </div>
        </div>

        <!-- Grouped Information Cards -->
        <div class="info-sections-grid">
          <!-- 1. Promoter / Developer Information -->
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <app-icon name="building" [size]="18" extraClass="section-icon"></app-icon>
                <h3 class="card-title">Promoter & Developer Details</h3>
              </div>
            </div>
            <div class="card-body">
              <dl class="data-list">
                <div class="data-row">
                  <dt class="data-term">Builder / Promoter Name</dt>
                  <dd class="data-def highlight">
                    @if (p.builderId) {
                      <a [routerLink]="['/builders', p.builderId]" class="builder-link">
                        {{ p.builderName }}
                        <app-icon name="external-link" [size]="12"></app-icon>
                      </a>
                    } @else {
                      {{ p.builderName || 'Not Available' }}
                    }
                  </dd>
                </div>

                <div class="data-row">
                  <dt class="data-term">Developer Entity ID</dt>
                  <dd class="data-def mono">
                    {{ p.builderId ? '#' + p.builderId : '—' }}
                  </dd>
                </div>

                <div class="data-row">
                  <dt class="data-term">Promoter Portfolio</dt>
                  <dd class="data-def">
                    @if (p.builderId) {
                      <a [routerLink]="['/builders', p.builderId]" class="btn btn-secondary btn-sm">
                        View All Projects by this Developer
                      </a>
                    } @else {
                      <span class="text-muted">No associated profile</span>
                    }
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- 2. Geographic & Location Data -->
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <app-icon name="map-pin" [size]="18" extraClass="section-icon"></app-icon>
                <h3 class="card-title">Location & Geography</h3>
              </div>
            </div>
            <div class="card-body">
              <dl class="data-list">
                <div class="data-row">
                  <dt class="data-term">District</dt>
                  <dd class="data-def">
                    <span class="badge badge-neutral">{{ p.district || 'Not Specified' }}</span>
                  </dd>
                </div>

                <div class="data-row">
                  <dt class="data-term">Locality / Sub-District</dt>
                  <dd class="data-def">{{ p.locality || 'Not Specified' }}</dd>
                </div>

                <div class="data-row">
                  <dt class="data-term">Postal Code (PIN)</dt>
                  <dd class="data-def mono">{{ p.pincode || '—' }}</dd>
                </div>

                <div class="data-row">
                  <dt class="data-term">State</dt>
                  <dd class="data-def">{{ p.state || 'MAHARASHTRA' }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- 3. Regulatory & Filing Timeline -->
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <app-icon name="calendar" [size]="18" extraClass="section-icon"></app-icon>
                <h3 class="card-title">Filing & Regulatory Timeline</h3>
              </div>
            </div>
            <div class="card-body">
              <dl class="data-list">
                <div class="data-row">
                  <dt class="data-term">MahaRERA Registration No</dt>
                  <dd class="data-def mono strong">{{ p.registrationNumber }}</dd>
                </div>

                <div class="data-row">
                  <dt class="data-term">Last Modified Date</dt>
                  <dd class="data-def mono">
                    {{ p.lastModifiedDate ? p.lastModifiedDate : '—' }}
                  </dd>
                </div>

                <div class="data-row">
                  <dt class="data-term">Registration Date</dt>
                  <dd class="data-def mono">
                    {{ p.registrationDate ? p.registrationDate : '—' }}
                  </dd>
                </div>

                <div class="data-row">
                  <dt class="data-term">Record Status</dt>
                  <dd class="data-def">
                    <span class="badge badge-success">
                      {{ p.projectStatus || 'Active Registration' }}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- 4. Source & Verification -->
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <app-icon name="check-circle" [size]="18" extraClass="section-icon"></app-icon>
                <h3 class="card-title">Source & Verification</h3>
              </div>
            </div>
            <div class="card-body">
              <dl class="data-list">
                <div class="data-row">
                  <dt class="data-term">Source Authority</dt>
                  <dd class="data-def">{{ p.sourceName || 'MahaRERA Public Registry' }}</dd>
                </div>

                <div class="data-row">
                  <dt class="data-term">Date Collected</dt>
                  <dd class="data-def mono">
                    {{ p.scrapedAt ? (p.scrapedAt | date:'medium') : '—' }}
                  </dd>
                </div>

                <div class="data-row">
                  <dt class="data-term">MahaRERA Project View</dt>
                  <dd class="data-def">
                    @if (p.detailsUrl) {
                      <a [href]="p.detailsUrl" target="_blank" rel="noopener noreferrer" class="link-external">
                        Open Portal Record
                        <app-icon name="external-link" [size]="12"></app-icon>
                      </a>
                    } @else {
                      <span class="text-muted">Unavailable</span>
                    }
                  </dd>
                </div>

                <div class="data-row">
                  <dt class="data-term">Original Public Application</dt>
                  <dd class="data-def">
                    @if (p.originalApplicationUrl) {
                      <a [href]="p.originalApplicationUrl" target="_blank" rel="noopener noreferrer" class="link-external">
                        View Form Document
                        <app-icon name="external-link" [size]="12"></app-icon>
                      </a>
                    } @else {
                      <span class="text-muted">Unavailable</span>
                    }
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .project-detail-page {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .detail-top-nav {
        display: flex;
        align-items: center;
      }

      /* Hero Card */
      .hero-card {
        padding: 1.5rem 1.75rem;
      }

      .hero-main {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1.25rem;
      }

      .hero-titles {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .reg-badge-row {
        display: flex;
        align-items: center;
        gap: 0.65rem;
      }

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #10b981;
      }

      .hero-project-name {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-main);
        letter-spacing: -0.02em;
        line-height: 1.2;
      }

      .hero-location {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.875rem;
        color: var(--text-muted);
      }

      .hero-actions {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        flex-wrap: wrap;
      }

      /* Info Grid */
      .info-sections-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
        gap: 1.5rem;
      }

      .card-title-group {
        display: flex;
        align-items: center;
        gap: 0.65rem;
      }

      .section-icon {
        color: var(--primary-600);
      }

      .data-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .data-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 1rem;
        border-bottom: 1px solid var(--border-subtle);
        padding-bottom: 0.75rem;
      }

      .data-row:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      .data-term {
        font-size: 0.825rem;
        color: var(--text-muted);
        font-weight: 500;
        flex-shrink: 0;
      }

      .data-def {
        font-size: 0.875rem;
        color: var(--text-main);
        text-align: right;
        word-break: break-word;
      }

      .data-def.highlight {
        font-weight: 600;
      }

      .data-def.mono {
        font-family: var(--font-mono);
      }

      .data-def.strong {
        font-weight: 600;
        color: var(--text-main);
      }

      .builder-link {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        color: var(--primary-700);
        font-weight: 600;
      }

      .link-external {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-weight: 500;
      }

      @media (max-width: 640px) {
        .info-sections-grid {
          grid-template-columns: 1fr;
        }
        .data-row {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
        }
        .data-def {
          text-align: left;
        }
      }
    `,
  ],
})
export class ProjectDetailComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly route = inject(ActivatedRoute);

  @Input() id?: string; // routed with withComponentInputBinding()

  readonly project = signal<ProjectResponseDTO | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const paramId = params.get('id') || this.id;
      if (paramId) {
        this.id = paramId;
        this.loadProject();
      }
    });
  }

  loadProject() {
    if (!this.id) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const numericId = Number(this.id);
    if (isNaN(numericId)) {
      this.errorMessage.set(`Invalid project ID: ${this.id}`);
      this.isLoading.set(false);
      return;
    }

    this.projectService.getProjectById(numericId).subscribe({
      next: (data) => {
        this.project.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load project details:', err);
        const msg =
          err?.error?.message ||
          `Project record #${this.id} could not be retrieved from the server.`;
        this.errorMessage.set(msg);
        this.isLoading.set(false);
      },
    });
  }
}
