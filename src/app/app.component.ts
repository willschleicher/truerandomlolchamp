import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ChampionSelectorComponent} from "./champion-selector/app-champion-selector/app-champion-selector.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChampionSelectorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'truerandomlolng';
}
