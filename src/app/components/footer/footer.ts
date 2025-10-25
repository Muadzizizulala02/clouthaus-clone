import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent {
  // We receive all the contact info from app.component
  @Input() email: string = '';
  @Input() phone: string = '';
  @Input() address1: string = '';
  @Input() address2: string = '';
  @Input() address3: string = '';
}