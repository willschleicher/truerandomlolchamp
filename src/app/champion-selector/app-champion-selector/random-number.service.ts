import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {lastValueFrom} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RandomNumberService {
  constructor(private http: HttpClient) {}

  async getRandomNumber(min: number, max: number): Promise<number> {
    try {
      const response = await lastValueFrom(this.http.get<string>(`https://www.random.org/integers/?num=1&min=${min}&max=${max}&col=1&base=10&format=plain&rnd=new`));
      return parseInt(response);
    } catch (error) {
      console.error('Error fetching random number:', error);
      return Math.floor(Math.random() * (max - min + 1)) + min; // Fallback to Math.random
    }
  }
}
