import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

interface ILocationFormState {
  scene: string;  
}

@Component({
  selector: 'app-main-game',
  templateUrl: './main-game.component.html',
  styleUrls: ['./main-game.component.css']
})
export class MainGameComponent {
  public selected: string = "cube";

  scene: FormControl = new FormControl();

  constructor() {

    const sceneChanges: Observable<string> = this.scene.valueChanges;
    sceneChanges.subscribe(val => this.selected = val);

    sceneChanges.subscribe(val => console.log(val));
  }
  selectScene(): void {

  }
}
