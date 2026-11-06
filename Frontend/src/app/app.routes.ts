import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    title: 'Dashboard — BuildIntel',
  },
  {
    path: 'scraper',
    loadComponent: () =>
      import('./features/scraper/scraper-control.component').then(
        (m) => m.ScraperControlComponent
      ),
    title: 'Scraper Control Center — BuildIntel',
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./features/projects/project-list/project-list.component').then(
        (m) => m.ProjectListComponent
      ),
    title: 'Data Explorer — BuildIntel',
  },
  {
    path: 'projects/:id',
    loadComponent: () =>
      import('./features/projects/project-detail/project-detail.component').then(
        (m) => m.ProjectDetailComponent
      ),
    title: 'Project Intelligence — BuildIntel',
  },
  {
    path: 'builders',
    loadComponent: () =>
      import('./features/builders/builder-list/builder-list.component').then(
        (m) => m.BuilderListComponent
      ),
    title: 'Promoters & Developers — BuildIntel',
  },
  {
    path: 'builders/:id',
    loadComponent: () =>
      import('./features/builders/builder-detail/builder-detail.component').then(
        (m) => m.BuilderDetailComponent
      ),
    title: 'Promoter Profile — BuildIntel',
  },
  {
    path: 'export',
    loadComponent: () =>
      import('./features/export/export.component').then((m) => m.ExportComponent),
    title: 'Excel Export — BuildIntel',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
