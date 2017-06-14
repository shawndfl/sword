import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { MainGameComponent } from './main-game/main-game.component';
import { ScnCubeComponent } from './scn-cube/scn-cube.component';

@NgModule({
  declarations: [
    AppComponent,
    MainGameComponent,
    ScnCubeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
