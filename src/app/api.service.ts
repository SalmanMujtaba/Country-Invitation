import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {
  }

  getData(): Observable<any> {
    return this.http.get("https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=5519852f4a07040e3ab904526fcf");
  }

  postData(countiresArray: any): Observable<any> {
    return this.http.post<any>('https://candidate.hubteam.com/candidateTest/v3/problem/result?userKey=5519852f4a07040e3ab904526fcf', { countries: [...countiresArray] });
  }
}
