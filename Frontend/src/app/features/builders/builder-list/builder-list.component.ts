import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BuilderService } from '../../../core/services/builder.service';
import { BuilderResponseDTO } from '../../../core/models/builder.model';
import { PaginatedResponse } from '../../../core/models/pagination.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-builder-list',
  imports: [
    CommonModule,
    RouterLink,
    IconComponent,
    PaginationComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="builders-page">
      <!-- Page Header -->
      <div class="page-header-row">
        <div>
          <h2 class="page-title-main">Promoters & Developers</h2>
          <p class="page-subtitle">
            Directory of real-estate developers registered under MahaRERA jurisdictions.
          </p>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" (click)="loadBuilders()">
          <app-icon name="refresh" [size]="14"></app-icon>
          Refresh
        </button>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="card">
          <app-loading-state message="Loading developers directory..."></app-loading-state>
        </div>
      }

      <!-- Error State -->
      @else if (errorMessage()) {
        <app-error-state
          title="Error Loading Promoters"
          [message]="errorMessage()!"
          (retry)="loadBuilders()"
        ></app-error-state>
      }

      <!-- Empty State -->
      @else if (builders().length === 0) {
        <div class="card">
          <app-empty-state
            icon="building"
            title="No promoters registered"
            description="No builder records found in the database."
          ></app-empty-state>
        </div>
      }

      <!-- Builders Data Table -->
      @else {
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 80px;">Entity ID</th>
                <th>Builder / Promoter Name</th>
                <th>Registration No</th>
                <th>Address</th>
                <th>Portfolio Count</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              @for (b of builders(); track b.id) {
                <tr>
                  <td>
                    <span class="badge badge-neutral badge-mono">#{{ b.id }}</span>
                  </td>
                  <td>
                    <div class="builder-name-cell">
                      <a [routerLink]="['/builders', b.id]" class="builder-link-main">
                        {{ b.builderName }}
                      </a>
                    </div>
                  </td>
                  <td>
                    <span class="mono-text">{{ b.registrationNumber || '—' }}</span>
                  </td>
                  <td>
                    <span class="address-text">{{ b.address || '—' }}</span>
                  </td>
                  <td>
                    <span class="badge badge-info">
                      <app-icon name="projects" [size]="12"></app-icon>
                      {{ b.projectCount }} {{ b.projectCount === 1 ? 'Project' : 'Projects' }}
                    </span>
                  </td>
                  <td class="text-right">
                    <a [routerLink]="['/builders', b.id]" class="btn btn-secondary btn-sm">
                      View Profile
                    </a>
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
      .builders-page {
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

      .builder-name-cell {
        display: flex;
        flex-direction: column;
      }

      .builder-link-main {
        font-weight: 600;
        color: var(--text-main);
        font-size: 0.9rem;
      }

      .builder-link-main:hover {
        color: var(--primary-600);
      }

      .mono-text {
        font-family: var(--font-mono);
        font-size: 0.825rem;
        color: var(--text-muted);
      }

      .address-text {
        font-size: 0.825rem;
        color: var(--text-muted);
      }

      .text-right {
        text-align: right;
      }
    `,
  ],
})
export class BuilderListComponent implements OnInit {
  private readonly builderService = inject(BuilderService);

  readonly builders = signal<BuilderResponseDTO[]>([]);
  readonly pageNumber = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly totalElements = signal<number>(0);
  readonly totalPages = signal<number>(0);
  readonly isLast = signal<boolean>(false);

  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.loadBuilders();
  }

  onPageChange(page: number) {
    this.pageNumber.set(page);
    this.loadBuilders();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.pageNumber.set(0);
    this.loadBuilders();
  }

  loadBuilders() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.builderService
      .getAllBuilders(this.pageNumber(), this.pageSize())
      .subscribe({
        next: (res: PaginatedResponse<BuilderResponseDTO>) => {
          this.builders.set(res.content);
          this.pageNumber.set(res.pageNumber);
          this.pageSize.set(res.pageSize);
          this.totalElements.set(res.totalElements);
          this.totalPages.set(res.totalPages);
          this.isLast.set(res.last);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load builders:', err);
          const msg =
            err?.error?.message ||
            'Unable to retrieve promoters from backend API.';
          this.errorMessage.set(msg);
          this.isLoading.set(false);
        },
      });
  }
}
