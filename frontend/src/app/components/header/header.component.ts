import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="header">
      <h1>🛠 Developer Onboarding</h1>
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
    h1 { margin: 0; font-size: 1.5rem; }
    p { margin: 4px 0 0; opacity: 0.7; font-size: 0.9rem; }
  `]
})
export class HeaderComponent {}
