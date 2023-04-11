import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ClimateData } from './types';

@Injectable({
  providedIn: 'root'
})
export class ClimateService {
  private _jsonURL: string = 'assets/ClimateData.json';

  constructor(private http: HttpClient) { }

  getAll(): Observable<ClimateData[]> {
    return this.http.get<ClimateData[]>(this._jsonURL);
  }

  search(term: string | ClimateData): Observable<ClimateData[]> {
    const searchTerm = term instanceof Object ? term.food.toLowerCase() : term.toLowerCase();
    return this.http.get<ClimateData[]>(this._jsonURL).pipe(
      map(result => {
        return result.filter(climateData => climateData.food.toLowerCase().includes(searchTerm))
      })
    )
  }
}
