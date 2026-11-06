import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { UiService } from '../../core/services/ui.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <header class="top-header">
      <div class="header-left">
        <button
          type="button"
          class="mobile-menu-btn btn btn-ghost btn-icon"
          (click)="ui.toggleSidebar()"
          aria-label="Toggle Navigation Menu"
        >
          <app-icon name="menu" [size]="20"></app-icon>
        </button>

        <div class="header-titles">
          <h1 class="page-title">{{ pageTitle() }}</h1>
        </div>
      </div>

      <div class="header-right">
        <a routerLink="/scraper" class="btn btn-primary btn-sm">
          <app-icon name="play" [size]="14"></app-icon>
          <span>Start Scraping</span>
        </a>
      </div>
    </header>
  `,
  styles: [
    `
      .top-header {
        height: var(--header-height);
        background-color: var(--bg-surface);
        border-bottom: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 1.5rem;
        position: sticky;
        top: 0;
        z-index: 30;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .mobile-menu-btn {
        display: none;
      }

      .header-titles {
        display: flex;
        align-items: baseline;
      }

      .page-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text-main);
        letter-spacing: -0.01em;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      @media (max-width: 900px) {
        .mobile-menu-btn {
          display: inline-flex;
        }
      }

      @media (max-width: 640px) {
        .top-header {
          padding: 0 1rem;
        }
      }
    `,
  ],
})
export class HeaderComponent {
  protected readonly ui = inject(UiService);
  private readonly router = inject(Router);
  readonly pageTitle = signal<string>('MahaRERA Project Intelligence');

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateTitle(event.urlAfterRedirects || event.url);
      });
    this.updateTitle(this.router.url);
  }

  private updateTitle(url: string) {
    if (url.includes('/scraper')) {
      this.pageTitle.set('Scraper Control');
    } else if (url.includes('/export')) {
      this.pageTitle.set('Data Export');
    } else if (url.includes('/projects/')) {
      this.pageTitle.set('Project Details');
    } else if (url.includes('/projects')) {
      this.pageTitle.set('Projects Directory');
    } else if (url.includes('/builders/')) {
      this.pageTitle.set('Builder Profile');
    } else if (url.includes('/builders')) {
      this.pageTitle.set('Builders & Promoters');
    } else {
      this.pageTitle.set('MahaRERA Project Intelligence');
    }
  }
}
