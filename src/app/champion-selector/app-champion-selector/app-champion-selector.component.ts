import {Component, OnInit} from '@angular/core';
import {AppChampionSelectorService} from "./app-champion-selector.service";
import {RandomNumberService} from "./random-number.service";
import {NgForOf, NgOptimizedImage} from "@angular/common";

interface Champion {
  id: string;
  name: string;
  image: { full: string };
  preloadedImage?: HTMLImageElement;
  isImageLoaded: boolean;
}

@Component({
  selector: 'app-champion-selector',
  standalone: true,
  imports: [
    NgForOf,
    NgOptimizedImage
  ],
  templateUrl: './app-champion-selector.component.html',
  styleUrl: './app-champion-selector.component.css'
})
export class ChampionSelectorComponent implements OnInit {
  champions: { [key: string]: Champion } = {};
  history: Champion[] = [];
  currentVersion = '';
  preloadedChampions: Champion[] = [];
  isLoading = true;
  defaultImagePath = 'assets/champiconfallback.jpg';

  constructor(
    private championService: AppChampionSelectorService,
    private randomNumberService: RandomNumberService
  ) {}

  async ngOnInit() {
    try {
      this.currentVersion = await this.championService.getLatestVersion();
      this.champions = await this.championService.getChampions(this.currentVersion);
      this.isLoading = false;
      await this.preloadRandomChampions();
    } catch (error) {
      console.error('Error initializing app:', error);
      this.isLoading = false;
    }
  }

  async getRandomChampion(): Promise<Champion> {
    const championIds = Object.keys(this.champions);
    const randomIndex = await this.randomNumberService.getRandomNumber(1, championIds.length);
    const championId = championIds[randomIndex - 1];
    return { ...this.champions[championId], isImageLoaded: false };
  }

  async getRandomChampionThatIsNotAlreadyInHistory(): Promise<Champion> {
    let newChampion: Champion;
    do {
      newChampion = await this.getRandomChampion();
    } while (this.history.some(champ => champ.id === newChampion.id) ||
             this.preloadedChampions.some(champ => champ.id === newChampion.id));
    return newChampion;
  }

  async preloadRandomChampions() {
    while (this.preloadedChampions.length < 3) {
      const champion = await this.getRandomChampionThatIsNotAlreadyInHistory();
      const image = new Image();
      image.src = `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/img/champion/${champion.image.full}`;
      image.onload = () => {
        champion.isImageLoaded = true;
      };
      this.preloadedChampions.push({ ...champion, preloadedImage: image });
    }
  }

  updateHistory(champion: Champion) {
    this.history.unshift(champion);
    if (this.history.length > 3) {
      this.history.pop();
    }
  }

  async onRandomChampClick() {
    if (this.preloadedChampions.length > 0) {
      const champion = this.preloadedChampions.shift()!;
      this.updateHistory(champion);
      this.preloadRandomChampions();
    } else {
      // Fallback in case preloaded champions are not available
      const newChampion = await this.getRandomChampionThatIsNotAlreadyInHistory();
      const newImage = new Image();
      newImage.src = `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/img/champion/${newChampion.image.full}`;
      newImage.onload = () => {
        newChampion.isImageLoaded = true;
      };
      this.updateHistory({ ...newChampion, preloadedImage: newImage });
    }
  }

  async rerollChampion(index: number) {
    if (this.preloadedChampions.length > 0) {
      this.history[index] = this.preloadedChampions.shift()!;
      this.preloadRandomChampions();
    } else {
      // Fallback in case preloaded champions are not available
      const newChampion = await this.getRandomChampionThatIsNotAlreadyInHistory();
      const newImage = new Image();
      newImage.src = `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/img/champion/${newChampion.image.full}`;
      newImage.onload = () => {
        newChampion.isImageLoaded = true;
      };
      this.history[index] = { ...newChampion, preloadedImage: newImage };
    }
  }

  getChampionImageSrc(champion: Champion): string {
    return champion.isImageLoaded ?
      `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/img/champion/${champion.image.full}` :
      this.defaultImagePath;
  }
}
