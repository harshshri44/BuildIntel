import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { UiService } from '../../core/services/ui.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <!-- Mobile Backdrop -->
    @if (ui.isSidebarOpen()) {
      <div class="sidebar-backdrop" (click)="ui.closeSidebar()"></div>
    }

    <aside class="sidebar" [class.open]="ui.isSidebarOpen()">
      <!-- Brand Header -->
      <div class="brand-container">
        <div class="brand-logo">
          <app-icon name="building" [size]="20" extraClass="brand-icon"></app-icon>
        </div>
        <div class="brand-text">
          <div class="brand-title">BuildIntel</div>
          <div class="brand-subtitle">Real Estate Platform</div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="nav-section" aria-label="Main Navigation">
        <ul class="nav-list">
          <li>
            <a
              routerLink="/dashboard"
              routerLinkActive="active"
              (click)="ui.closeSidebar()"
              class="nav-item"
            >
              <app-icon name="dashboard" [size]="18"></app-icon>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a
              routerLink="/scraper"
              routerLinkActive="active"
              (click)="ui.closeSidebar()"
              class="nav-item"
            >
              <app-icon name="cpu" [size]="18"></app-icon>
              <span>Scraper</span>
            </a>
          </li>
          <li>
            <a
              routerLink="/projects"
              routerLinkActive="active"
              (click)="ui.closeSidebar()"
              class="nav-item"
            >
              <app-icon name="projects" [size]="18"></app-icon>
              <span>Projects</span>
            </a>
          </li>
          <li>
            <a
              routerLink="/builders"
              routerLinkActive="active"
              (click)="ui.closeSidebar()"
              class="nav-item"
            >
              <app-icon name="building" [size]="18"></app-icon>
              <span>Builders</span>
            </a>
          </li>
          <li>
            <a
              routerLink="/export"
              routerLinkActive="active"
              (click)="ui.closeSidebar()"
              class="nav-item"
            >
              <app-icon name="download" [size]="18"></app-icon>
              <span>Export</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  `,
  styles: [
    `
      .sidebar {
        width: var(--sidebar-width);
        background-color: var(--bg-surface);
        border-right: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        height: 100vh;
        position: sticky;
        top: 0;
        z-index: 40;
        transition: transform var(--transition-normal);
      }

      .brand-container {
        height: var(--header-height);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0 1.25rem;
        border-bottom: 1px solid var(--border-color);
      }

      .brand-logo {
        width: 36px;
        height: 36px;
        background-color: var(--primary-600);
        color: var(--text-inverse);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-xs);
      }

      .brand-text {
        display: flex;
        flex-direction: column;
      }

      .brand-title {
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-main);
        letter-spacing: -0.02em;
        line-height: 1.2;
      }

      .brand-subtitle {
        font-size: 0.72rem;
        color: var(--text-subtle);
        font-weight: 500;
      }

      .nav-section {
        flex: 1;
        padding: 1.25rem 0.85rem;
      }

      .nav-list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.6rem 0.75rem;
        border-radius: var(--radius-md);
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-muted);
        transition: background-color var(--transition-fast), color var(--transition-fast);
        text-decoration: none;
        cursor: pointer;
      }

      .nav-item:hover {
        background-color: var(--bg-subtle);
        color: var(--text-main);
        text-decoration: none;
      }

      .nav-item.active {
        background-color: var(--primary-50);
        color: var(--primary-700);
        font-weight: 600;
      }

      .sidebar-backdrop {
        display: none;
      }

      @media (max-width: 900px) {
        .sidebar {
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          transform: translateX(-100%);
          box-shadow: var(--shadow-lg);
        }

        .sidebar.open {
          transform: translateX(0);
        }

        .sidebar-backdrop {
          display: block;
          position: fixed;
          inset: 0;
          background-color: rgba(15, 23, 42, 0.4);
          z-index: 35;
          backdrop-filter: blur(2px);
        }
      }
    `,
  ],
})
export class SidebarComponent {
  protected readonly ui = inject(UiService);
}
