import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScraperService } from '../../core/services/scraper.service';
import { DashboardStatsDTO } from '../../core/models/scraper.model';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-export',
  imports: [CommonModule, IconComponent],
  template: `
    <div class="export-page">
      <div class="page-header-row">
        <div>
          <h2 class="page-title-main">Export Project Data</h2>
          <p class="page-subtitle">
            Download formatted Microsoft Excel spreadsheets (.xlsx) containing verified project listings and developer details.
          </p>
        </div>
      </div>

      <div class="export-layout-grid">
        <!-- Main Export Card -->
        <div class="card export-main-card">
          <div class="export-icon-hero">
            <app-icon name="download" [size]="32" extraClass="hero-icon"></app-icon>
          </div>

          <h3 class="export-hero-title">Download MahaRERA Dataset</h3>
          <p class="export-hero-desc">
            Produces an Excel workbook with frozen header rows, auto-fitted columns, clickable links to MahaRERA project filings, and separate worksheets for Projects and Builders.
          </p>

          <div class="export-stat-chips">
            <div class="stat-chip">
              <span class="chip-val">{{ stats()?.totalProjects || 0 }}</span>
              <span class="chip-lbl">Projects</span>
            </div>
            <div class="stat-chip">
              <span class="chip-val">{{ stats()?.totalBuilders || 0 }}</span>
              <span class="chip-lbl">Builders</span>
            </div>
            <div class="stat-chip">
              <span class="chip-val">{{ stats()?.completedJobsCount || 0 }}</span>
              <span class="chip-lbl">Scraping Jobs</span>
            </div>
          </div>

          <div class="export-actions">
            <a
              [href]="exportUrl"
              class="btn btn-primary btn-lg download-btn"
              download
            >
              <app-icon name="download" [size]="20"></app-icon>
              <span>Download Excel (.xlsx)</span>
            </a>
          </div>

          <p class="export-footnote">
            Includes all project listings and registered builders collected to date.
          </p>
        </div>

        <!-- Specifications Card -->
        <div class="card specs-card">
          <div class="specs-header">
            <app-icon name="info" [size]="18" extraClass="text-primary"></app-icon>
            <h4 class="specs-title">Export Workbook Structure</h4>
          </div>

          <div class="specs-sections">
            <div class="spec-block">
              <div class="spec-sheet-title">Sheet 1: Projects</div>
              <ul class="spec-columns-list">
                <li>Registration Number & Project Name</li>
                <li>Builder / Promoter Entity</li>
                <li>District, Pincode & Locality</li>
                <li>Registration Date & Last Modified Date</li>
                <li>Direct MahaRERA Detail & Application URLs</li>
                <li>Collection Date</li>
              </ul>
            </div>

            <div class="spec-block">
              <div class="spec-sheet-title">Sheet 2: Promoters / Builders</div>
              <ul class="spec-columns-list">
                <li>Builder Entity ID</li>
                <li>Promoter Legal Name</li>
                <li>Registration / Certificate Number</li>
                <li>Official Registered Address</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .export-page {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .page-header-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
      }

      .page-title-main {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--text-main);
      }

      .page-subtitle {
        font-size: 0.85rem;
        color: var(--text-muted);
        max-width: 680px;
        margin-top: 0.25rem;
      }

      .export-layout-grid {
        display: grid;
        grid-template-columns: 3fr 2fr;
        gap: 1.5rem;
      }

      @media (max-width: 900px) {
        .export-layout-grid {
          grid-template-columns: 1fr;
        }
      }

      .export-main-card {
        padding: 2.5rem 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .export-icon-hero {
        width: 64px;
        height: 64px;
        border-radius: var(--radius-lg);
        background-color: var(--primary-50);
        color: var(--primary-600);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.25rem;
      }

      .export-hero-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-main);
      }

      .export-hero-desc {
        font-size: 0.85rem;
        color: var(--text-muted);
        max-width: 480px;
        margin-top: 0.5rem;
        line-height: 1.5;
      }

      .export-stat-chips {
        display: flex;
        gap: 1.5rem;
        margin: 1.75rem 0;
        padding: 0.85rem 1.5rem;
        background-color: var(--bg-app);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);
      }

      .stat-chip {
        display: flex;
        flex-direction: column;
      }

      .chip-val {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-main);
      }

      .chip-lbl {
        font-size: 0.72rem;
        color: var(--text-subtle);
      }

      .download-btn {
        padding: 0.75rem 2rem;
        font-size: 0.95rem;
        font-weight: 600;
        box-shadow: var(--shadow-sm);
        cursor: pointer;
      }

      .export-footnote {
        font-size: 0.72rem;
        color: var(--text-subtle);
        margin-top: 1.5rem;
      }

      .specs-card {
        padding: 1.5rem;
      }

      .specs-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1.25rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--border-color);
      }

      .specs-title {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--text-main);
      }

      .specs-sections {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .spec-sheet-title {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--primary-700);
        margin-bottom: 0.4rem;
      }

      .spec-columns-list {
        list-style: disc;
        padding-left: 1.25rem;
        font-size: 0.78rem;
        color: var(--text-muted);
        line-height: 1.6;
      }
    `,
  ],
})
export class ExportComponent implements OnInit {
  private readonly scraperService = inject(ScraperService);
  readonly stats = signal<DashboardStatsDTO | null>(null);
  readonly exportUrl = this.scraperService.getExcelDownloadUrl();

  ngOnInit() {
    this.scraperService.getDashboardStats().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Failed to load stats for export:', err),
    });
  }
}
