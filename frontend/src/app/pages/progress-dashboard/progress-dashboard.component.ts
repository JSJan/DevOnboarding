import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { InstallationService } from '../../services/installation.service';
import { WebSocketService } from '../../services/websocket.service';
import { InstallationTask, InstallationProgress, InstallStatus } from '../../models/types';

interface TaskDisplay extends InstallationTask {
  displayName?: string;
  currentProgress: number;
  currentLog: string;
}

@Component({
  selector: 'app-progress-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h2>Installation Progress</h2>
        <div class="overall-progress">
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="overallProgress"></div>
          </div>
          <span>{{ overallProgress }}%</span>
        </div>
        <button
          *ngIf="!isStarted"
          class="btn-primary"
          (click)="startInstallation()">
          Begin Installation
        </button>
      </div>

      <!-- Task List -->
      <div class="task-list">
        <div
          *ngFor="let task of tasks"
          class="task-card"
          [class]="'status-' + task.status">
          <div class="task-header">
            <span class="status-icon">{{ getStatusIcon(task.status) }}</span>
            <strong>{{ task.displayName || task.softwareId }}</strong>
            <span class="status-badge">{{ task.status }}</span>
          </div>
          <div *ngIf="task.currentProgress > 0 && task.status === 'in-progress'" class="task-progress">
            <div class="progress-bar small">
              <div class="progress-fill" [style.width.%]="task.currentProgress"></div>
            </div>
          </div>
          <p *ngIf="task.currentLog" class="task-log">{{ task.currentLog }}</p>
          <p *ngIf="task.error" class="task-error">Error: {{ task.error }}</p>
          <button
            *ngIf="task.status === 'failed'"
            class="btn-retry"
            (click)="retryTask(task.id)">
            Retry
          </button>
        </div>
      </div>

      <!-- Completion -->
      <div *ngIf="isComplete" class="completion">
        <h3>Installation Complete!</h3>
        <p>{{ completedCount }}/{{ tasks.length }} packages installed successfully.</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 16px 0; }
    .dashboard-header { margin-bottom: 24px; }
    h2 { margin-bottom: 12px; }

    .overall-progress { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .progress-bar {
      flex: 1; height: 12px; background: #e0e0e0; border-radius: 6px; overflow: hidden;
    }
    .progress-bar.small { height: 6px; }
    .progress-fill {
      height: 100%; background: #0f3460; border-radius: 6px; transition: width 0.3s;
    }

    .task-list { display: flex; flex-direction: column; gap: 12px; }
    .task-card {
      padding: 16px; border: 1px solid #e0e0e0; border-radius: 8px;
      background: #fff; border-left: 4px solid #e0e0e0;
    }
    .task-card.status-pending { border-left-color: #9e9e9e; }
    .task-card.status-in-progress { border-left-color: #1976d2; background: #f3f8ff; }
    .task-card.status-completed { border-left-color: #388e3c; }
    .task-card.status-failed { border-left-color: #d32f2f; background: #fff5f5; }

    .task-header { display: flex; align-items: center; gap: 8px; }
    .status-icon { font-size: 1.2rem; }
    .status-badge {
      margin-left: auto; font-size: 0.75rem; padding: 2px 8px;
      border-radius: 4px; background: #f0f0f0; text-transform: uppercase;
    }
    .task-progress { margin-top: 8px; }
    .task-log { margin: 8px 0 0; font-size: 0.85rem; color: #555; font-family: monospace; }
    .task-error { margin: 8px 0 0; font-size: 0.85rem; color: #d32f2f; }

    .btn-primary {
      padding: 10px 24px; background: #0f3460; color: #fff; border: none;
      border-radius: 6px; cursor: pointer; font-size: 0.95rem;
    }
    .btn-retry {
      margin-top: 8px; padding: 4px 12px; background: #d32f2f; color: #fff;
      border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;
    }

    .completion {
      margin-top: 24px; padding: 24px; background: #e8f5e9; border-radius: 8px; text-align: center;
    }
    .completion h3 { color: #2e7d32; }
  `]
})
export class ProgressDashboardComponent implements OnInit, OnDestroy {
  installationId = '';
  tasks: TaskDisplay[] = [];
  isStarted = false;
  isComplete = false;
  overallProgress = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private installationService: InstallationService,
    private wsService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.installationId = this.route.snapshot.params['installationId'];
    this.loadInstallation();
    this.setupWebSocket();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.wsService.leaveInstallation(this.installationId);
    this.wsService.disconnect();
  }

  private loadInstallation(): void {
    this.installationService.getStatus(this.installationId).subscribe((data) => {
      this.tasks = data.tasks.map((t: InstallationTask) => ({
        ...t,
        displayName: t.softwareId,
        currentProgress: t.status === 'completed' ? 100 : 0,
        currentLog: '',
      }));
    });
  }

  private setupWebSocket(): void {
    this.wsService.connect();
    this.wsService.joinInstallation(this.installationId);

    this.subscriptions.push(
      this.wsService.progress$.subscribe((progress: InstallationProgress) => {
        this.updateTaskStatus(progress);
      }),
      this.wsService.logs$.subscribe((log) => {
        this.updateTaskLog(log);
      }),
      this.wsService.complete$.subscribe(() => {
        this.isComplete = true;
      })
    );
  }

  private updateTaskStatus(progress: InstallationProgress): void {
    const task = this.tasks.find((t) => t.id === progress.taskId);
    if (task) {
      task.status = progress.status;
      task.currentProgress = progress.progress;
      if (progress.error) task.error = progress.error;
    }
    this.calculateOverallProgress();
  }

  private updateTaskLog(log: { taskId: string; message: string; progress: number }): void {
    const task = this.tasks.find((t) => t.id === log.taskId);
    if (task) {
      task.currentLog = log.message;
      task.currentProgress = log.progress;
    }
  }

  private calculateOverallProgress(): void {
    if (this.tasks.length === 0) return;
    const completed = this.tasks.filter((t) => t.status === 'completed').length;
    this.overallProgress = Math.round((completed / this.tasks.length) * 100);
  }

  get completedCount(): number {
    return this.tasks.filter((t) => t.status === 'completed').length;
  }

  startInstallation(): void {
    this.isStarted = true;
    this.installationService.start(this.installationId).subscribe();
  }

  retryTask(taskId: string): void {
    this.installationService.retryTask(this.installationId, taskId).subscribe(() => {
      const task = this.tasks.find((t) => t.id === taskId);
      if (task) {
        task.status = 'pending';
        task.error = undefined;
      }
    });
  }

  getStatusIcon(status: InstallStatus): string {
    switch (status) {
      case 'pending': return '⏳';
      case 'in-progress': return '⚙️';
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'skipped': return '⏭️';
      default: return '•';
    }
  }
}
