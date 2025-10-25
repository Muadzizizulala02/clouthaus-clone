import { Component, OnInit, HostListener, importProvidersFrom } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { DataService } from './services/data';
import { ProjectContent } from './models/project-data.model';

import { HeaderComponent } from './components/header/header';
import { HeroComponent } from './components/hero/hero';
import { ContentSectionComponent } from './components/content-section/content-section';
import { ContactFormComponent } from './components/contact-form/contact-form';
import { FooterComponent } from './components/footer/footer';

// --- NEW: Import GSAP and its ScrollToPlugin ---
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet,
    HeaderComponent,
    HeroComponent,
    ContentSectionComponent,
    ContactFormComponent,
    FooterComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  
  public data$!: Observable<ProjectContent>;
  public sectionIds: string[] = [];
  private currentSectionIndex = 0;
  private isScrolling = false;

  // --- NEW: This is where you control the animation "feel" ---
  /**
   * The duration of the scroll animation in seconds.
   * (e.g., 0.8 = fast, 1.5 = slow)
   */
  private scrollDuration = 1.2;

  /**
   * The easing function for the animation.
   * "power2.inOut" is a smooth start and end.
   * Other options: "power1.inOut", "expo.inOut", "elastic.out(1, 0.3)"
   */
  private scrollEase = "power2.inOut";
  

  constructor(private dataService: DataService) {
    // --- NEW: Register the GSAP plugin so we can use it ---
    gsap.registerPlugin(ScrollToPlugin);
  }

  ngOnInit(): void {
    this.data$ = this.dataService.getProjectData().pipe(
      tap(data => {
        if (this.sectionIds.length === 0) {
          this.sectionIds.push('hero');
          data.projectDetails.forEach((_, i) => this.sectionIds.push(`section-${i}`));
          this.sectionIds.push('register');
        }
      })
    );
  }

  // This function is unchanged
  @HostListener('window:wheel', ['$event'])
  onWindowScroll(event: WheelEvent) {
    event.preventDefault();
    if (this.isScrolling) {
      return;
    }

    const direction = event.deltaY > 0 ? 'down' : 'up';

    if (direction === 'down') {
      if (this.currentSectionIndex < this.sectionIds.length - 1) {
        this.currentSectionIndex++;
      }
    } else {
      if (this.currentSectionIndex > 0) {
        this.currentSectionIndex--;
      }
    }
    this.scrollToSection(this.sectionIds[this.currentSectionIndex]);
  }

  // This function is unchanged
  public onHeaderNavigation(id: string) {
    const index = this.sectionIds.indexOf(id);
    if (index > -1 && !this.isScrolling) {
      this.currentSectionIndex = index; // Update the index
      this.scrollToSection(id); // Scroll to the section
    }
  }
  
  // --- MODIFIED: This function now uses GSAP ---
  private scrollToSection(id: string) {
    const element = document.getElementById(id);
    const container = document.querySelector('.scroll-container');
    
    if (element && container) {
      this.isScrolling = true; // Set cooldown START

      // Use GSAP to animate the scroll
      gsap.to(container, {
        duration: this.scrollDuration, // Use our controllable duration
        scrollTo: { 
          y: element.offsetTop // Scroll to the element's top position
        },
        ease: this.scrollEase, // Use our controllable ease
        onComplete: () => {
          // Set cooldown END when animation is finished
          this.isScrolling = false; 
        }
      });
    }
  }

  // --- REMOVED: We no longer need the separate setScrollCooldown function ---
  // The GSAP onComplete callback handles this perfectly.

}