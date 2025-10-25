import { Component, OnInit, HostListener } from '@angular/core';
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
  private previousSectionIndex = 0;
  private isScrolling = false;

  private scrollDuration = 1.1;
  private scrollEase = 'power2.inOut';

  constructor(private dataService: DataService) {
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

        // ✅ Animate first section on load
        setTimeout(() => this.animateInnerSection(document.getElementById('hero')), 300);
      })
    );
  }

  // ✅ One scroll = one section move
  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    event.preventDefault();

    if (this.isScrolling) return;
    this.previousSectionIndex = this.currentSectionIndex;

    if (event.deltaY > 0) {
      // Scroll down
      if (this.currentSectionIndex < this.sectionIds.length - 1) {
        this.currentSectionIndex++;
      }
    } else {
      // Scroll up
      if (this.currentSectionIndex > 0) {
        this.currentSectionIndex--;
      }
    }

    if (this.previousSectionIndex !== this.currentSectionIndex) {
      this.isScrolling = true;
      this.scrollToSection(event.deltaY > 0); // Pass true if scrolling down
    }
  }

  // ✅ Header navigation click
  public onHeaderNavigation(id: string) {
    const index = this.sectionIds.indexOf(id);
    if (index > -1 && !this.isScrolling) {
      this.previousSectionIndex = this.currentSectionIndex;
      this.currentSectionIndex = index;
      this.isScrolling = true;
      this.scrollToSection(index > this.previousSectionIndex);
    }
  }

  // ✅ Handles smooth scroll + optional transition
  private scrollToSection(isScrollingDown: boolean) {
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
        this.isScrolling = false;

        // Only animate inner content when scrolling down
        if (isScrollingDown) {
          this.animateInnerSection(targetElement);
        }
      }
    });
  }

  // ✅ Animate content inside the section (no warnings, no blinking)
  private animateInnerSection(targetElement: HTMLElement | null) {
    if (!targetElement || targetElement.classList.contains('revealed')) return;

    const targetContent = Array.from(
      targetElement.querySelectorAll('.anim-image, .anim-text')
    );

    if (targetContent.length === 0) {
      targetElement.classList.add('revealed');
      return;
    }

    gsap.set(targetContent, { autoAlpha: 0, y: 30 });

    gsap.fromTo(
      targetContent,
      { autoAlpha: 0, y: 30 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.08,
        immediateRender: false,
        onComplete: () => {
          targetElement.classList.add('revealed');
        }
      }
    );
  }
}
