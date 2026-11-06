import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-empty-state',
  imports: [CommonModule, IconComponent],
  template: `
    <div class="empty-container">
      <div class="icon-bubble">
        <app-icon [name]="icon" [size]="28" extraClass="text-subtle"></app-icon>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>
      @if (actionLabel) {
        <button type="button" class="btn btn-secondary btn-sm" (click)="action.emit()">
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .empty-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 3.5rem 1.5rem;
        gap: 0.5rem;
      }
      .icon-bubble {
        width: 52px;
        height: 52px;
        border-radius: var(--radius-full);
        background-color: var(--bg-subtle);
        border: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 0.5rem;
        color: var(--text-subtle);
      }
      .empty-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-main);
      }
      .empty-description {
        font-size: 0.85rem;
        color: var(--text-muted);
        max-width: 400px;
        margin-bottom: 0.5rem;
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() icon: string = 'search';
  @Input() title: string = 'No records found';
  @Input() description: string = 'Try adjusting your search criteria or clearing filters.';
  @Input() actionLabel?: string;
  @Output() action = new EventEmitter<void>();
}
