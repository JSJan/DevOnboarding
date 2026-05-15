import { Routes } from '@angular/router';
import { SoftwareSelectionComponent } from './pages/software-selection/software-selection.component';
import { ProgressDashboardComponent } from './pages/progress-dashboard/progress-dashboard.component';
import { RoleDashboardComponent } from './pages/role-dashboard/role-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: RoleDashboardComponent },
  { path: 'setup', component: SoftwareSelectionComponent },
  { path: 'progress/:installationId', component: ProgressDashboardComponent },
];
