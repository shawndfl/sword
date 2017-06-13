import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';

@Component({})
export class CameraComponent implements OnInit {

  public camera: THREE.PerspectiveCamera;
  private angle: THREE.Vector2 = new THREE.Vector2(0, 0);
  private lastPosition: THREE.Vector2 = new THREE.Vector2(0, 0);
  private readonly Scale: number = .05;
  private readonly MoveScale: number = 5;
  private readonly TwoPi: number = Math.PI * 2.0;

  private position: THREE.Vector3 = new THREE.Vector3(0, 0, -300);

  constructor() {

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);

    var position: THREE.Vector3 = new THREE.Vector3(0, 0, -300);
    var look: THREE.Vector3 = new THREE.Vector3(0, 0, -1);
    var right: THREE.Vector3 = new THREE.Vector3(1, 0, 0);
    var up: THREE.Vector3 = new THREE.Vector3(0, 1, 0);
    this.lookatForCamera(right, up, look, position);
  }

  debug(): void {

    var position: THREE.Vector3 = new THREE.Vector3(0, 0, -300);
    var look: THREE.Vector3 = new THREE.Vector3(0, 0, -1);
    var right: THREE.Vector3 = new THREE.Vector3(1, 0, 0);
    var up: THREE.Vector3 = new THREE.Vector3(0, 1, 0);

    this.camera.matrix.extractBasis(right, up, look);
    var te = this.camera.matrix.elements;
    var position = new THREE.Vector3(te[12], te[13], te[14]);


    console.log("right: " + right.x + ", " + right.y + ", " + right.z);
    console.log("up: " + up.x + ", " + up.y + ", " + up.z);
    console.log("look: " + look.x + ", " + look.y + ", " + look.z);
    console.log("position: " + position.x + ", " + position.y + ", " + position.z);
  }

  lookatForCamera(xAxis: THREE.Vector3, yAxis: THREE.Vector3, zAxis: THREE.Vector3, eye: THREE.Vector3): void {
    this.camera.matrix.makeBasis(xAxis, yAxis, zAxis);
    this.camera.matrix.setPosition(eye);
    this.camera.matrixAutoUpdate = false;
    this.camera.updateMatrixWorld(true);
  }


  over(mouse: MouseEvent): void {
    this.lastPosition.x = mouse.x;
    this.lastPosition.y = mouse.y;
  }

  move(mouse: MouseEvent): void {

    if (mouse.buttons === 1) {
      var deltaX = (this.lastPosition.x - mouse.x) * this.Scale;
      var deltaY = (this.lastPosition.y - mouse.y) * this.Scale;

      this.angle.x += deltaX * this.Scale;
      this.angle.y += deltaY * this.Scale;

      this.updateCamera();
    }
    this.lastPosition.x = mouse.x;
    this.lastPosition.y = mouse.y;

  }

  keyDown(key: KeyboardEvent): void {
    var direction: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    switch (key.keyCode) {
      case 87: //W       
        direction.add(new THREE.Vector3(0, 0, -1));
        break;
      case 65: //A
        direction.add(new THREE.Vector3(-1, 0, 0));
        break;
      case 68: //D
        direction.add(new THREE.Vector3(1, 0, 0));
        break;
      case 83: //S
        direction.add(new THREE.Vector3(0, 0, 1));
        break;
      case 69: //E
        direction.add(new THREE.Vector3(0, 1, 0));
        break;
      case 88: //X
        direction.add(new THREE.Vector3(0, -1, 0));
        break;
    }

    if (direction.length() > 0) {
      direction.multiplyScalar(this.MoveScale);
      var look: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
      var right: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
      var up: THREE.Vector3 = new THREE.Vector3(0, 0, 0);


      this.camera.matrix.extractBasis(right, up, look);

      look.multiplyScalar(direction.z);
      up.multiplyScalar(direction.y);
      right.multiplyScalar(direction.x);

      this.position.add(right).add(up).add(look);

      this.updateCamera();
    }

    //console.log("Down key.char: " + key.keyCode);
  }

  keyUp(key: KeyboardEvent): void {
    console.log("Up  key.char: " + key.keyCode);
  }

  private updateCamera(): void {

    //console.log("angle: " + this.angle.x + ", " + this.angle.y);
    if (this.angle.x > this.TwoPi)
      this.angle.x += -this.TwoPi;

    if (this.angle.x < -this.TwoPi)
      this.angle.x += this.TwoPi;

    if (this.angle.y > this.TwoPi)
      this.angle.y += -this.TwoPi;

    if (this.angle.y < -this.TwoPi)
      this.angle.y += this.TwoPi;

    var look: THREE.Vector3 = new THREE.Vector3(0, 0, -1);
    var right: THREE.Vector3 = new THREE.Vector3(1, 0, 0);
    var up: THREE.Vector3 = new THREE.Vector3(0, 1, 0);

    look.applyAxisAngle(up, this.angle.x);
    right.crossVectors(up, look);
    right.normalize();

    up = up.applyAxisAngle(right, this.angle.y);
    up.normalize();

    look.crossVectors(right, up);
    look.normalize();

    this.lookatForCamera(right, up, look, this.position);
  }

  ngOnInit() {

  }

}
