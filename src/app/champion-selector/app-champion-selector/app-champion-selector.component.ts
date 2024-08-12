import {Component, OnInit} from '@angular/core';
import {AppChampionSelectorService} from "./app-champion-selector.service";
import {RandomNumberService} from "./random-number.service";
import {NgForOf} from "@angular/common";

interface Champion {
  id: string;
  name: string;
  image: { full: string };
  preloadedImage?: HTMLImageElement;  // Add this line
}

@Component({
  selector: 'app-champion-selector',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './app-champion-selector.component.html',
  styleUrl: './app-champion-selector.component.css'
})
export class ChampionSelectorComponent implements OnInit {
  champions: { [key: string]: Champion } = {};
  history: Champion[] = [];
  currentVersion = '';
  preloadedChampion: Champion | null = null;
  preloadedImage: HTMLImageElement | null = null;
  isLoading = true;

  constructor(
    private championService: AppChampionSelectorService,
    private randomNumberService: RandomNumberService
  ) {}

  async ngOnInit() {
    try {
      this.currentVersion = await this.championService.getLatestVersion();
      this.champions = await this.championService.getChampions(this.currentVersion);
      this.isLoading = false;
      await this.preloadRandomChampion();
    } catch (error) {
      console.error('Error initializing app:', error);
      this.isLoading = false;
    }
  }

  async getRandomChampion(): Promise<Champion> {
    const championIds = Object.keys(this.champions);
    const randomIndex = await this.randomNumberService.getRandomNumber(1, championIds.length);
    const championId = championIds[randomIndex - 1];
    return this.champions[championId];
  }

  async getRandomChampionThatIsNotAlreadyInHistory(): Promise<Champion> {
    let newChampion: Champion;
    do {
      newChampion = await this.getRandomChampion();
    } while (this.history.some(champ => champ.id === newChampion.id));
    return newChampion;
  }

  async preloadRandomChampion() {
    this.preloadedChampion = await this.getRandomChampionThatIsNotAlreadyInHistory();
    this.preloadedImage = new Image();
    this.preloadedImage.src = `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/img/champion/${this.preloadedChampion.image.full}`;
    await new Promise((resolve) => {
      this.preloadedImage!.onload = resolve;
    });
  }

  updateHistory(champion: Champion, image: HTMLImageElement) {
    const championWithImage: Champion = { ...champion, preloadedImage: image };
    this.history.unshift(championWithImage);
    if (this.history.length > 3) {
      this.history.pop();
    }
  }

  async onRandomChampClick() {
    if (this.preloadedChampion && this.preloadedImage) {
      this.updateHistory(this.preloadedChampion, this.preloadedImage);
      this.preloadedChampion = null;
      this.preloadedImage = null;
      this.preloadRandomChampion();
    } else {
      const newChampion = await this.getRandomChampionThatIsNotAlreadyInHistory();
      const newImage = new Image();
      newImage.src = `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/img/champion/${newChampion.image.full}`;
      await new Promise((resolve) => {
        newImage.onload = resolve;
      });
      this.updateHistory(newChampion, newImage);
    }
  }

  async rerollChampion(index: number) {
    if (this.preloadedChampion && this.preloadedImage) {
      this.history[index] = { ...this.preloadedChampion, preloadedImage: this.preloadedImage };
      this.preloadedChampion = null;
      this.preloadedImage = null;
      this.preloadRandomChampion();
    } else {
      const newChampion = await this.getRandomChampionThatIsNotAlreadyInHistory();
      const newImage = new Image();
      newImage.src = `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/img/champion/${newChampion.image.full}`;
      await new Promise((resolve) => {
        newImage.onload = resolve;
      });
      this.history[index] = { ...newChampion, preloadedImage: newImage };
    }
  }
}
