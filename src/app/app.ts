import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { DataService } from './services/data'; // Make sure this path is correct
import { ProjectContent } from './models/project-data.model';
import { HeaderComponent } from './components/header/header'; // Make sure this path is correct
import { HeroComponent } from './components/hero/hero'; // Make sure this path is correct
import { ContentSectionComponent } from './components/content-section/content-section'; // Make sure this path is correct
import { ContactFormComponent } from './components/contact-form/contact-form'; // Make sure this path is correct
import { FooterComponent } from './components/footer/footer'; // Make sure this path is correct
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
    FooterComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent implements OnInit {
  public data$!: Observable<ProjectContent>;
  public sectionIds: string[] = [];

  private currentSectionIndex = 0;
  private previousSectionIndex = 0;
  private isScrolling = false;
  private scrollDuration = 1.1;
  private scrollEase = 'power2.inOut';

  constructor(private dataService: DataService) {
    gsap.registerPlugin(ScrollToPlugin);
  }

  ngOnInit(): void {
    this.data$ = this.dataService.getProjectData().pipe(
      tap((data) => {
        if (this.sectionIds.length === 0) {
          this.sectionIds.push('hero');
          data.projectDetails.forEach((_, i) => this.sectionIds.push(`section-${i}`));
          this.sectionIds.push('register');
        } // Animate first section on load

        setTimeout(() => this.animateInnerSection(document.getElementById('hero')), 300);
      })
    );
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    event.preventDefault();
    if (this.isScrolling) return;

    this.previousSectionIndex = this.currentSectionIndex;

    if (event.deltaY > 0) {
      if (this.currentSectionIndex < this.sectionIds.length - 1) {
        this.currentSectionIndex++;
      }
    } else {
      if (this.currentSectionIndex > 0) {
        this.currentSectionIndex--;
      }
    }

    if (this.previousSectionIndex !== this.currentSectionIndex) {
      this.isScrolling = true;
      this.scrollToSection(); // We don't need to pass the direction
    }
  }

  public onHeaderNavigation(id: string) {
    const index = this.sectionIds.indexOf(id);
    if (index > -1 && !this.isScrolling) {
      this.previousSectionIndex = this.currentSectionIndex;
      this.currentSectionIndex = index;
      this.isScrolling = true;
      this.scrollToSection(); // We don't need to pass the direction
    }
  } // --- MODIFIED FUNCTION ---

  private scrollToSection() {
    // Removed the 'isScrollingDown' parameter
    const container = document.querySelector('.scroll-container');
    const targetElement = document.getElementById(this.sectionIds[this.currentSectionIndex]);

    if (!container || !targetElement) {
      this.isScrolling = false;
      return;
    }

    gsap.to(container, {
      duration: this.scrollDuration,
      scrollTo: { y: targetElement.offsetTop },
      ease: this.scrollEase,
      onComplete: () => {
        this.isScrolling = false; // --- THIS IS THE CHANGE --- // Always call the animate function. // That function's 'revealed' check will handle running it only once.

        this.animateInnerSection(targetElement);
      },
    });
  }

  private animateInnerSection(targetElement: HTMLElement | null) {
    // This 'revealed' check correctly prevents it from running more than once
    if (!targetElement || targetElement.classList.contains('revealed')) return;

    const targetContent = Array.from(targetElement.querySelectorAll('.anim-image, .anim-text'));

    if (targetContent.length === 0) {
      targetElement.classList.add('revealed');
      return;
    } // Set initial state (which now works because of our SCSS fix)

    gsap.set(targetContent, { autoAlpha: 0, x: 50 }); // Animate FROM the state we just set TO the final state

    gsap.to(targetContent, {
      // Changed from 'fromTo' to 'to' for simplicity
      autoAlpha: 1,
      x: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.1,
      onComplete: () => {
        targetElement.classList.add('revealed');
      },
    });
  }
}
