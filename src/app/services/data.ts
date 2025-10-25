import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, timer, switchMap, shareReplay, map, tap } from 'rxjs';
import { ApiResponse, ProjectContent } from '../models/project-data.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private dataUrl = 'assets/general.json';
  
  // This is the main Observable that our components will use.
  // It will automatically update with new data every 30 seconds.
  public projectData$: Observable<ProjectContent>;

  constructor(private http: HttpClient) {
    // timer(0, 30000) = start immediately (0ms), then run every 30 seconds (30000ms).
    this.projectData$ = timer(0, 30000).pipe(
      // switchMap cancels the previous request and switches to a new one
      switchMap(() => 
        this.http.get<ApiResponse>(this.dataUrl).pipe(
          tap(response => console.log('Fetched new data:', response)), // For debugging
          map(response => response.content) // We only care about the 'content' object
        )
      ),
      // shareReplay(1) caches the last emitted value for all new subscribers
      // and shares the ongoing request, preventing multiple fetches.
      shareReplay(1) 
    );
  }

  /**
   * A simple getter that returns the hot, auto-updating Observable.
   */
  public getProjectData(): Observable<ProjectContent> {
    return this.projectData$;
  }
}