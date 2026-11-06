import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-error-state',
  imports: [CommonModule, IconComponent],
  template: `
    <div class="error-container">
      <div class="error-header">
        <app-icon name="alert-triangle" [size]="20" extraClass="error-icon"></app-icon>
        <div class="error-title-wrap">
          <h4 class="error-title">{{ title }}</h4>
          @if (status) {
            <span class="badge badge-danger badge-mono">HTTP {{ status }}</span>
          }
        </div>
      </div>
      <p class="error-message">{{ message }}</p>
      @if (details && details.length > 0) {
        <ul class="error-details">
          @for (d of details; track d) {
            <li>{{ d }}</li>
          }
        </ul>
      }
      <div class="error-actions">
        <button type="button" class="btn btn-secondary btn-sm" (click)="retry.emit()">
          <app-icon name="refresh" [size]="14"></app-icon>
          Retry Request
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .error-container {
        padding: 1.25rem 1.5rem;
        border: 1px solid var(--badge-danger-border);
        background-color: var(--badge-danger-bg);
        border-radius: var(--radius-lg);
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin: 1rem 0;
      }
      .error-header {
        display: flex;
        align-items: center;
        gap: 0.65rem;
      }
      .error-title-wrap {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .error-icon {
        color: var(--badge-danger-text);
      }
      .error-title {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--badge-danger-text);
        margin: 0;
      }
      .error-message {
        font-size: 0.85rem;
        color: var(--badge-danger-text);
        line-height: 1.45;
      }
      .error-details {
        margin-left: 1.25rem;
        font-size: 0.8rem;
        color: var(--badge-danger-text);
      }
      .error-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    `,
  ],
})
export class ErrorStateComponent {
  @Input() title: string = 'Unable to load data';
  @Input() message: string = 'Unable to connect to the server. Please ensure the service is running and try again.';
  @Input() status?: number;
  @Input() details?: string[];
  @Output() retry = new EventEmitter<void>();
}
