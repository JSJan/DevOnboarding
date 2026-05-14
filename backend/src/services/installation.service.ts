import { v4 as uuidv4 } from 'uuid';
import { InstallationRequest, InstallationTask, InstallStatus, Platform } from '../types';
import { CatalogService } from './catalog.service';
import { getSocketIO } from '../websocket/socket.handler';
import { getDatabase } from '../database/db';

export class InstallationService {
  private catalogService = new CatalogService();

  create(platform: Platform, selectedSoftware: string[]): InstallationRequest {
    const installation: InstallationRequest = {
      id: uuidv4(),
      platform,
      selectedSoftware,
      createdAt: new Date().toISOString(),
    };

    const db = getDatabase();
    db.prepare(
      'INSERT INTO installations (id, platform, selected_software, created_at) VALUES (?, ?, ?, ?)'
    ).run(installation.id, platform, JSON.stringify(selectedSoftware), installation.createdAt);

    // Create tasks in dependency order
    const orderedSoftware = this.catalogService.getDependencyOrder(selectedSoftware, platform);
    for (const softwareId of orderedSoftware) {
      const taskId = uuidv4();
      db.prepare(
        'INSERT INTO tasks (id, installation_id, software_id, status) VALUES (?, ?, ?, ?)'
      ).run(taskId, installation.id, softwareId, 'pending');
    }

    return installation;
  }

  getById(id: string): { installation: InstallationRequest; tasks: InstallationTask[] } | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM installations WHERE id = ?').get(id) as any;
    if (!row) return null;

    const tasks = db.prepare('SELECT * FROM tasks WHERE installation_id = ?').all(id) as any[];

    return {
      installation: {
        id: row.id,
        platform: row.platform,
        selectedSoftware: JSON.parse(row.selected_software),
        createdAt: row.created_at,
      },
      tasks: tasks.map((t) => ({
        id: t.id,
        installationId: t.installation_id,
        softwareId: t.software_id,
        status: t.status,
        logs: t.logs ? JSON.parse(t.logs) : [],
        startedAt: t.started_at,
        completedAt: t.completed_at,
        error: t.error,
      })),
    };
  }

  start(installationId: string): boolean {
    const data = this.getById(installationId);
    if (!data) return false;

    // Execute tasks sequentially respecting dependency order
    this.executeTasksSequentially(installationId, data.tasks, data.installation.platform);
    return true;
  }

  private async executeTasksSequentially(
    installationId: string,
    tasks: InstallationTask[],
    platform: Platform
  ) {
    const io = getSocketIO();
    const db = getDatabase();

    for (const task of tasks) {
      // Update status to in-progress
      db.prepare('UPDATE tasks SET status = ?, started_at = ? WHERE id = ?').run(
        'in-progress',
        new Date().toISOString(),
        task.id
      );

      io.to(installationId).emit('progress', {
        installationId,
        taskId: task.id,
        softwareId: task.softwareId,
        status: 'in-progress' as InstallStatus,
        progress: 0,
      });

      try {
        // Simulate installation (replace with actual agent communication)
        await this.executeInstallation(task, platform, installationId);

        db.prepare('UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?').run(
          'completed',
          new Date().toISOString(),
          task.id
        );

        io.to(installationId).emit('progress', {
          installationId,
          taskId: task.id,
          softwareId: task.softwareId,
          status: 'completed' as InstallStatus,
          progress: 100,
        });
      } catch (error: any) {
        db.prepare('UPDATE tasks SET status = ?, error = ? WHERE id = ?').run(
          'failed',
          error.message,
          task.id
        );

        io.to(installationId).emit('progress', {
          installationId,
          taskId: task.id,
          softwareId: task.softwareId,
          status: 'failed' as InstallStatus,
          progress: 0,
          error: error.message,
        });
      }
    }

    io.to(installationId).emit('installation-complete', { installationId });
  }

  private executeInstallation(
    task: InstallationTask,
    platform: Platform,
    installationId: string
  ): Promise<void> {
    const io = getSocketIO();
    const software = this.catalogService.getById(task.softwareId);

    if (!software) {
      return Promise.reject(new Error(`Software ${task.softwareId} not found in catalog`));
    }

    const platformConfig = software.platforms[platform];
    if (!platformConfig) {
      return Promise.reject(new Error(`${software.displayName} not available for ${platform}`));
    }

    // TODO: Replace with actual agent gRPC call
    // For now, emit log events to simulate progress
    return new Promise((resolve) => {
      const steps = [
        `Resolving ${software.displayName} v${software.version}...`,
        `Using package manager: ${platformConfig.manager}`,
        `Executing: ${platformConfig.command}`,
        `Verifying installation: ${platformConfig.verify}`,
        `${software.displayName} installed successfully.`,
      ];

      let step = 0;
      const interval = setInterval(() => {
        if (step < steps.length) {
          io.to(installationId).emit('log', {
            installationId,
            taskId: task.id,
            softwareId: task.softwareId,
            message: steps[step],
            progress: Math.round(((step + 1) / steps.length) * 100),
          });
          step++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });
  }

  retryTask(installationId: string, taskId: string): { success: boolean } {
    const db = getDatabase();
    db.prepare('UPDATE tasks SET status = ?, error = NULL WHERE id = ? AND installation_id = ?').run(
      'pending',
      taskId,
      installationId
    );
    return { success: true };
  }

  getLogs(installationId: string): { taskId: string; softwareId: string; logs: string[] }[] {
    const db = getDatabase();
    const tasks = db.prepare('SELECT * FROM tasks WHERE installation_id = ?').all(installationId) as any[];
    return tasks.map((t) => ({
      taskId: t.id,
      softwareId: t.software_id,
      logs: t.logs ? JSON.parse(t.logs) : [],
    }));
  }
}
