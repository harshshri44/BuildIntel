import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UiService {
  readonly isSidebarOpen = signal<boolean>(false);

  toggleSidebar() {
    this.isSidebarOpen.update((open) => !open);
  }

  closeSidebar() {
    this.isSidebarOpen.set(false);
  }

  openSidebar() {
    this.isSidebarOpen.set(true);
  }
}
