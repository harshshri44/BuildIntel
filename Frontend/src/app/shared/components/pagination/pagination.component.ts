import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule, IconComponent],
  template: `
    <div class="pagination-bar">
      <div class="pagination-summary">
        Showing
        <span class="count-highlight">{{ fromItem }}</span>
        to
        <span class="count-highlight">{{ toItem }}</span>
        of
        <span class="count-highlight">{{ totalElements }}</span>
        records
      </div>

      <div class="pagination-controls">
        <div class="page-size-wrap">
          <label for="pageSizeSelect" class="page-size-label">Per page:</label>
          <select
            id="pageSizeSelect"
            class="form-select page-size-select"
            [value]="pageSize"
            (change)="onPageSizeChange($event)"
          >
            <option [value]="10">10</option>
            <option [value]="20">20</option>
            <option [value]="50">50</option>
          </select>
        </div>

        <div class="page-steppers">
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            [disabled]="pageNumber === 0"
            (click)="pageChange.emit(pageNumber - 1)"
            aria-label="Previous page"
          >
            <app-icon name="chevron-left" [size]="14"></app-icon>
            Previous
          </button>

          <span class="page-info">
            Page <strong>{{ pageNumber + 1 }}</strong> of <strong>{{ totalPages > 0 ? totalPages : 1 }}</strong>
          </span>

          <button
            type="button"
            class="btn btn-secondary btn-sm"
            [disabled]="isLast || pageNumber >= totalPages - 1"
            (click)="pageChange.emit(pageNumber + 1)"
            aria-label="Next page"
          >
            Next
            <app-icon name="chevron-right" [size]="14"></app-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .pagination-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
        padding: 0.85rem 1.25rem;
        border-top: 1px solid var(--border-color);
        background-color: var(--bg-surface);
        border-bottom-left-radius: var(--radius-lg);
        border-bottom-right-radius: var(--radius-lg);
      }
      .pagination-summary {
        font-size: 0.825rem;
        color: var(--text-muted);
      }
      .count-highlight {
        font-weight: 600;
        color: var(--text-main);
      }
      .pagination-controls {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        flex-wrap: wrap;
      }
      .page-size-wrap {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .page-size-label {
        font-size: 0.825rem;
        color: var(--text-muted);
      }
      .page-size-select {
        height: 32px;
        padding: 0.2rem 0.5rem;
        font-size: 0.825rem;
      }
      .page-steppers {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .page-info {
        font-size: 0.825rem;
        color: var(--text-muted);
        padding: 0 0.5rem;
      }
      .page-info strong {
        color: var(--text-main);
      }
      @media (max-width: 640px) {
        .pagination-bar {
          flex-direction: column;
          align-items: flex-start;
        }
        .pagination-controls {
          width: 100%;
          justify-content: space-between;
        }
      }
    `,
  ],
})
export class PaginationComponent {
  @Input() pageNumber: number = 0;
  @Input() pageSize: number = 10;
  @Input() totalElements: number = 0;
  @Input() totalPages: number = 0;
  @Input() isLast: boolean = false;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get fromItem(): number {
    if (this.totalElements === 0) return 0;
    return this.pageNumber * this.pageSize + 1;
  }

  get toItem(): number {
    return Math.min((this.pageNumber + 1) * this.pageSize, this.totalElements);
  }

  onPageSizeChange(event: Event) {
    const val = Number((event.target as HTMLSelectElement).value);
    if (!isNaN(val)) {
      this.pageSizeChange.emit(val);
    }
  }
}
