import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { BuilderService } from '../../../core/services/builder.service';
import { BuilderDetailResponseDTO } from '../../../core/models/builder.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-builder-detail',
  imports: [
    CommonModule,
    RouterLink,
    IconComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="builder-detail-page">
      <!-- Back Navigation -->
      <div class="detail-top-nav">
        <a routerLink="/builders" class="btn btn-secondary btn-sm">
          <app-icon name="arrow-left" [size]="14"></app-icon>
          Back to Builders
        </a>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="card">
          <app-loading-state message="Loading promoter profile and portfolio..."></app-loading-state>
        </div>
      }

      <!-- Error State -->
      @else if (errorMessage()) {
        <app-error-state
          title="Promoter Profile Not Found"
          [message]="errorMessage()!"
          (retry)="loadBuilder()"
        ></app-error-state>
      }

      <!-- Builder Details Content -->
      @else if (builder(); as b) {
        <!-- Promoter Header Card -->
        <div class="card builder-header-card">
          <div class="header-main">
            <div class="builder-avatar">
              <app-icon name="building" [size]="28"></app-icon>
            </div>
            <div class="header-info">
              <div class="badge-row">
                <span class="badge badge-neutral badge-mono">Entity #{{ b.id }}</span>
                <span class="badge badge-info">
                  {{ b.projects.length }} Registered {{ b.projects.length === 1 ? 'Project' : 'Projects' }}
                </span>
              </div>
              <h2 class="builder-title">{{ b.builderName }}</h2>
              <div class="builder-meta">
                <span class="meta-item">
                  <strong>Registration:</strong> {{ b.registrationNumber || 'Not on file' }}
                </span>
                <span class="meta-separator">•</span>
                <span class="meta-item">
                  <strong>Address:</strong> {{ b.address || 'Address not listed' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Associated Projects Section -->
        <div class="projects-section">
          <div class="section-header">
            <div>
              <h3 class="section-title">Registered Projects Portfolio</h3>
              <p class="section-subtitle">
                Real-estate projects filed under this developer with MahaRERA
              </p>
            </div>
          </div>

          @if (b.projects.length === 0) {
            <div class="card">
              <app-empty-state
                icon="projects"
                title="No projects associated"
                description="No registered MahaRERA projects are currently linked with this entity."
              ></app-empty-state>
            </div>
          } @else {
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Registration No</th>
                    <th>Project Name</th>
                    <th>Location</th>
                    <th>Last Modified</th>
                    <th class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  @for (proj of b.projects; track proj.id) {
                    <tr>
                      <td>
                        <span class="badge badge-neutral badge-mono">
                          {{ proj.registrationNumber }}
                        </span>
                      </td>
                      <td>
                        <a [routerLink]="['/projects', proj.id]" class="proj-link">
                          {{ proj.projectName }}
                        </a>
                      </td>
                      <td>
                        <span class="location-text">
                          {{ proj.locality ? proj.locality + ', ' : '' }}{{ proj.district }}
                        </span>
                      </td>
                      <td>
                        <span class="mono-date">
                          {{ proj.lastModifiedDate ? proj.lastModifiedDate : '—' }}
                        </span>
                      </td>
                      <td class="text-right">
                        <div class="action-cell">
                          <a [routerLink]="['/projects', proj.id]" class="btn btn-secondary btn-sm">
                            Details
                          </a>
                          @if (proj.detailsUrl) {
                            <a
                              [href]="proj.detailsUrl"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="btn btn-ghost btn-sm btn-icon"
                              title="Open MahaRERA record"
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
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .builder-detail-page {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .detail-top-nav {
        display: flex;
        align-items: center;
      }

      /* Header Card */
      .builder-header-card {
        padding: 1.5rem 1.75rem;
      }

      .header-main {
        display: flex;
        align-items: flex-start;
        gap: 1.25rem;
      }

      .builder-avatar {
        width: 52px;
        height: 52px;
        background-color: var(--primary-50);
        color: var(--primary-600);
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border: 1px solid var(--primary-100);
      }

      .header-info {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .badge-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .builder-title {
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--text-main);
        letter-spacing: -0.02em;
        line-height: 1.25;
      }

      .builder-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        font-size: 0.825rem;
        color: var(--text-muted);
      }

      .meta-item strong {
        color: var(--text-main);
      }

      .meta-separator {
        color: var(--border-color);
      }

      /* Projects Section */
      .projects-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .section-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-main);
      }

      .section-subtitle {
        font-size: 0.825rem;
        color: var(--text-muted);
        margin-top: 0.15rem;
      }

      .proj-link {
        font-weight: 600;
        color: var(--primary-700);
      }

      .location-text {
        font-size: 0.85rem;
      }

      .mono-date {
        font-family: var(--font-mono);
        font-size: 0.8rem;
        color: var(--text-muted);
      }

      .action-cell {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.4rem;
      }

      .text-right {
        text-align: right;
      }

      @media (max-width: 640px) {
        .header-main {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class BuilderDetailComponent implements OnInit {
  private readonly builderService = inject(BuilderService);
  private readonly route = inject(ActivatedRoute);

  @Input() id?: string;

  readonly builder = signal<BuilderDetailResponseDTO | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const paramId = params.get('id') || this.id;
      if (paramId) {
        this.id = paramId;
        this.loadBuilder();
      }
    });
  }

  loadBuilder() {
    if (!this.id) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const numericId = Number(this.id);
    if (isNaN(numericId)) {
      this.errorMessage.set(`Invalid builder ID: ${this.id}`);
      this.isLoading.set(false);
      return;
    }

    this.builderService.getBuilderById(numericId).subscribe({
      next: (data) => {
        this.builder.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load builder profile:', err);
        const msg =
          err?.error?.message ||
          `Promoter record #${this.id} could not be retrieved from the server.`;
        this.errorMessage.set(msg);
        this.isLoading.set(false);
      },
    });
  }
}
