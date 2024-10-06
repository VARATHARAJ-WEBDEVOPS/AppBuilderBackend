import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-layout-loading-animation',
  templateUrl: './layout-loading-animation.component.html',
  styleUrls: ['./layout-loading-animation.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // Improves performance by reducing change detection overhead
})
export class LayoutLoadingAnimationComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
