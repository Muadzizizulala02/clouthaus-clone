import { Component, Input, Output, EventEmitter } from '@angular/core'; // Add Output & EventEmitter
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  @Input() projectName: string = 'Loading...';
  // NEW: This event will fire when a link is clicked
  @Output() navClicked = new EventEmitter<string>();

  // NEW: This function will be called by our links
  onNavLinkClick(id: string, event: MouseEvent) {
    event.preventDefault(); // Stop the link from trying to navigate
    this.navClicked.emit(id); // Emit the ID (e.g., "hero") to the parent
  }
}