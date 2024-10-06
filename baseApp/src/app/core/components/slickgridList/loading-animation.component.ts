import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-animation',
  template: `
    <div class="loading-animation"></div>
  `,
  styles: [`
  .slick-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

    .loading-animation {
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      animation: spin 1s linear infinite;
      margin: auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoadingAnimationComponent {}
