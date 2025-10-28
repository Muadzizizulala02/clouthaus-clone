import { Component, OnInit, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
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
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  public data$!: Observable<ProjectContent>; //This will hold data fetched from DataService
  public sectionIds: string[] = []; //nak store section id mana so angular know which one to scroll into

  private currentSectionIndex = 0; // which section showing
  private previousSectionIndex = 0;
  private isScrolling = false; // nak prevents multiple scrolls at once
  private scrollContainer: HTMLElement | null = null; // Reference to our scroll container
  private scrollListener: any; // Store the scroll listener for cleanup
  // animation setting
  private scrollDuration = 1.5;
  private scrollEase = 'power2.inOut';

  // "Nak guna DataService punya tool"
  constructor(private dataService: DataService) {
    // inject DataServices
    gsap.registerPlugin(ScrollToPlugin);
  }

  ngOnInit(): void {
    this.data$ = this.dataService.getProjectData().pipe(
      // Assign Observable to data$
      tap((data) => {
        if (this.sectionIds.length === 0) {
          //Initialize sectionIds Array
          this.sectionIds.push('hero');
          data.projectDetails.forEach((_, i) => this.sectionIds.push(`section-${i}`));
          this.sectionIds.push('register'); // add register as last section id
        }
        
        // Wait for the view to update with the data, then setup scroll container
        setTimeout(() => {
          this.setupScrollContainer();
          //ANIMATION: Animate hero section after brief delay
          this.animateInnerSection(document.getElementById('hero'));
        }, 100);
      })
    );
  }

  ngAfterViewInit(): void {
    // Initial setup attempt - but container might not exist yet due to *ngIf
    setTimeout(() => {
      this.setupScrollContainer();
    }, 500);
  }

  ngOnDestroy(): void {
    // Clean up the scroll listener when component is destroyed
    if (this.scrollListener && this.scrollContainer) {
      this.scrollContainer.removeEventListener('scroll', this.scrollListener);
    }
  }

  // Setup scroll container after data loads and view updates
  private setupScrollContainer() {
    if (this.scrollContainer) return; // Already setup
    
    this.scrollContainer = document.querySelector('.scroll-container');
    
    if (this.scrollContainer && !this.scrollListener) {
      this.scrollListener = this.onScrollbar.bind(this);
      this.scrollContainer.addEventListener('scroll', this.scrollListener);
    }
  }

  // listen to mousewheel event
  @HostListener('wheel', ['$event']) //Angular decorator that listens to DOM events on the component
  onWheel(event: WheelEvent) {
    // Only prevent default if we're going to handle the scroll
    if (this.isScrolling) return; // Prevents multiple rapid scrolls while animation is in progress

    this.previousSectionIndex = this.currentSectionIndex; // nak tracking navigation history

    //  User scrolled DOWN
    if (event.deltaY > 0) {
      if (this.currentSectionIndex < this.sectionIds.length - 1) {
        this.currentSectionIndex++;
      }
      // User scrolled UP
    } else {
      if (this.currentSectionIndex > 0) {
        this.currentSectionIndex--;
      }
    }

    if (this.previousSectionIndex !== this.currentSectionIndex) {
      event.preventDefault(); // Only prevent default if we're actually handling the scroll
      this.isScrolling = true;
      this.scrollToSection(); // Call the animation method
    }
  }

  // listen to scrollbar event (regular browser scrollbar)
  private onScrollbar(event: Event) {
    if (this.isScrolling) return; // Prevents conflict with wheel/header animations

    // Detect which section is currently visible and trigger its animation
    this.detectVisibleSection();
  }

  // Nak handle navigation clicks (from header)
  public onHeaderNavigation(id: string) {
    const index = this.sectionIds.indexOf(id);
    if (index > -1 && !this.isScrolling) {
      // cari id for the selected index
      this.previousSectionIndex = this.currentSectionIndex;
      // jump to the index
      this.currentSectionIndex = index;
      // still scroll eventho from nav header
      this.isScrolling = true;
      this.scrollToSection(); 
    }
  } 

  // the logic behind animation execution
  private scrollToSection() {
    // nak cari scrollable area in the DOM
    const container = this.scrollContainer || document.querySelector('.scroll-container');
    // get the target position
    const targetElement = document.getElementById(this.sectionIds[this.currentSectionIndex]);
    
    // validation to check if the target is exist or not
    if (!container || !targetElement) {
      this.isScrolling = false;
      return;
    }

    // animate the scroll to target (container)
    gsap.to(container, {
      duration: this.scrollDuration,
      // animate to the targeted element
      scrollTo: { y: targetElement.offsetTop },
      ease: this.scrollEase,
      onComplete: () => {
        this.isScrolling = false; 
        // nak animate inner content
        this.animateInnerSection(targetElement);
      },
    });
  }

  // logic to detect which section is currently visible when using scrollbar
  private detectVisibleSection() {
    if (!this.scrollContainer) {
      this.scrollContainer = document.querySelector('.scroll-container');
      if (!this.scrollContainer) return;
    }
    
    const scrollTop = this.scrollContainer.scrollTop; // current scroll position
    const containerHeight = this.scrollContainer.clientHeight; // height of visible area
    
    // Check each section to see which one is currently in view
    for (let i = 0; i < this.sectionIds.length; i++) {
      const section = document.getElementById(this.sectionIds[i]);
      if (section) {
        const sectionTop = section.offsetTop; // section position from top
        const sectionBottom = sectionTop + section.offsetHeight; // section bottom position
        
        // Check if section is mostly in view (adjust these values as needed)
        const triggerPoint = containerHeight * 0.5; // Trigger when 50% of section is visible
        
        if (scrollTop >= sectionTop - triggerPoint && 
            scrollTop <= sectionBottom - triggerPoint) {
          
          // If we found a new section that's visible
          if (this.currentSectionIndex !== i) {
            this.currentSectionIndex = i;
            // Trigger animation for this section
            this.animateInnerSection(section);
          }
          break; // Stop checking once we found the visible section
        }
      }
    }
  }

  // the logic of animation dalam section
  private animateInnerSection(targetElement: HTMLElement | null) {
    // if dah animate, x perlu animate lagi
    if (!targetElement || targetElement.classList.contains('revealed')) return;

    // cari element yg nak animatekan
    const targetContent = Array.from(targetElement.querySelectorAll('.anim-image, .anim-text'));

    // Empty Content Check
    if (targetContent.length === 0) {
      targetElement.classList.add('revealed');
      return;
    }

    gsap.set(targetContent, { autoAlpha: 0, x: 50 }); // Animate FROM the state we just set TO the final state

    gsap.to(targetContent, {
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