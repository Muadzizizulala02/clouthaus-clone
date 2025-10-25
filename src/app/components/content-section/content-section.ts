import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectDetail } from '../../models/project-data.model';

@Component({
  selector: 'app-content-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-section.html',
  styleUrl: './content-section.scss'
})
export class ContentSectionComponent {
  // We receive the entire 'detail' object for this section
  @Input() detail!: ProjectDetail;
  
  // We receive a boolean to control the layout direction
  @Input() isReversed: boolean = false;
}