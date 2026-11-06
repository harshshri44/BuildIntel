import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-state',
  imports: [CommonModule],
  template: `
    <div class="loading-container" [style.min-height.px]="minHeight">
      <div class="spinner"></div>
      <p class="loading-message">{{ message }}</p>
    </div>
  `,
  styles: [
    `
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 1.5rem;
        gap: 0.85rem;
      }
      .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid var(--border-color);
        border-top-color: var(--primary-600);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      .loading-message {
        font-size: 0.875rem;
        color: var(--text-muted);
        font-weight: 500;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoadingStateComponent {
  @Input() message: string = 'Loading data from backend...';
  @Input() minHeight: number = 200;
}
