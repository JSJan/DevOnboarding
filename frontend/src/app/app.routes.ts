import { Routes } from '@angular/router';
import { SoftwareSelectionComponent } from './pages/software-selection/software-selection.component';
import { ProgressDashboardComponent } from './pages/progress-dashboard/progress-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'setup', pathMatch: 'full' },
  { path: 'setup', component: SoftwareSelectionComponent },
  { path: 'progress/:installationId', component: ProgressDashboardComponent },
];
