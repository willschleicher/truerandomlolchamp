import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {lastValueFrom} from "rxjs";
import champions from './champions';

interface Champion {
  id: string;
  name: string;
  image: { full: string };
}

@Injectable({
  providedIn: 'root'
})
export class AppChampionSelectorService {
  constructor(private http: HttpClient) {}

  async getLatestVersion(): Promise<string> {
    try {
      const response = await lastValueFrom(this.http.get<string[]>('https://ddragon.leagueoflegends.com/api/versions.json'));
      return response[0];
    } catch (error) {
      console.error('Error fetching latest version:', error);
      return '13.1.1'; // Fallback to a known version
    }
  }

  async getChampions(version: string): Promise<any> {
    try {
      const response = await lastValueFrom(this.http.get<any>(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`));
      return response.data;
    } catch (error) {
      console.error('Error fetching champions:', error);
      return this.getBackupChampions(); // Use backup if API fails
    }
  }

  private getBackupChampions(): { [key: string]: Champion } {
    // Convert the backup champions to the format expected by the component
    return Object.entries(champions).reduce<{ [key: string]: Champion }>((acc, [id, name]) => {
      acc[name] = { id, name, image: { full: `${name}.png` } };
      return acc;
    }, {});
  }
}
