import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="header">
      <div class="header-top">
        <h1>🛠 Developer Onboarding</h1>
        <nav class="nav">
          <a routerLink="/dashboard" class="nav-link">Dashboard</a>
          <a routerLink="/setup" class="nav-link">Setup</a>
        </nav>
      </div>
      <p>Automated development environment setup</p>
    </header>
  `,
  styles: [`
    .header {
      background: #1a1a2e;
      color: #fff;
      padding: 20px 32px;
      border-bottom: 3px solid #0f3460;
    }
    .header-top { display: flex; align-items: center; justify-content: space-between; }
    h1 { margin: 0; font-size: 1.5rem; }
    p { margin: 4px 0 0; opacity: 0.7; font-size: 0.9rem; }
    .nav { display: flex; gap: 16px; }
    .nav-link {
      color: #bbdefb; text-decoration: none; font-size: 0.95rem;
      padding: 4px 12px; border-radius: 4px; transition: background 0.2s;
    }
    .nav-link:hover { background: rgba(255,255,255,0.1); color: #fff; }
  `]
})
export class HeaderComponent {}
