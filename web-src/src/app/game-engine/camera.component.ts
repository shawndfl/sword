import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import * as GAME from "../game-engine/environment"

@Component({})
export class CameraComponent implements GAME.LifecycleBehavior {

  private _camera: THREE.PerspectiveCamera;
  private angle: THREE.Vector2 = new THREE.Vector2(0, 0);
  private lastPosition: THREE.Vector2 = new THREE.Vector2(0, 0);
  private readonly TwoPi: number = Math.PI * 2.0;

  // Target following variables 
  private targetObject: THREE.Object3D;
  private lastTargetPos: THREE.Vector3;
  private fullSpeedCount: number = 0;
  private closeEnough: boolean = false;
  private freeCamera = false;

  /**
   * Set the target for the camera to follow.
   * @param target 
   */
  public set target(target: THREE.Object3D) {
    this.targetObject = target;
    this.lastTargetPos = this.targetObject.getWorldPosition();
  }

  /**
   * Gets the target
   */
  public get target(): THREE.Object3D {
    return this.targetObject;
  }

  public get camera(): THREE.PerspectiveCamera {
    return this._camera;
  }
  /**
   * Scale the camera's rotation speed
   */
  public angleScale: number = .005;

  /**
   * Scale the camera's movement speed
   */
  public moveScale: number = 5;

  /**
   * The camera's position
   */
  public position: THREE.Vector3 = new THREE.Vector3(0, 100, 200);

  constructor(camera: THREE.PerspectiveCamera) {
    this._camera = camera;
    this.updateCamera();
  }

  debug(): void {

    var look: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    var right: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    var up: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    this.camera.matrix.extractBasis(right, up, look);
    var te = this.camera.matrix.elements;
    var position = new THREE.Vector3(te[12], te[13], te[14]);

    console.log("right: " + right.x + ", " + right.y + ", " + right.z);
    console.log("up: " + up.x + ", " + up.y + ", " + up.z);
    console.log("look: " + look.x + ", " + look.y + ", " + look.z);
    console.log("position: " + position.x + ", " + position.y + ", " + position.z);
  }

  private lookatForCamera(xAxis: THREE.Vector3, yAxis: THREE.Vector3, zAxis: THREE.Vector3, eye: THREE.Vector3): void {
    this.position = eye;
    this.camera.matrix.makeBasis(xAxis, yAxis, zAxis);
    this.camera.matrix.setPosition(eye);
    this.camera.matrixAutoUpdate = false;
    this.camera.updateMatrixWorld(true);
  }

  initialize() { /*nop*/ }
  start() { /*nop*/ }

  mouseOver(mouse: MouseEvent): void {
    this.lastPosition.x = mouse.x;
    this.lastPosition.y = mouse.y;
  }

  mouseMove(mouse: MouseEvent): void {

    if (mouse.buttons === 1) {
      var deltaX = -(mouse.x - this.lastPosition.x) * this.angleScale;
      var deltaY = -(mouse.y - this.lastPosition.y) * this.angleScale;

      this.angle.x += deltaX;
      this.angle.y += deltaY;

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
      direction.multiplyScalar(this.moveScale);
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
  }

  keyUp(key: KeyboardEvent): void {
    switch (key.keyCode) {
      case 9: //TAB
        this.freeCamera = !this.freeCamera;
        if (this.freeCamera)
          console.log("Free Camera");
        else
          console.log("Target Camera");
        break;
    }
  }

  update(delta: number) {
    if (this.freeCamera)
      return;

    var followSpeed = 5.0;
    var distanceMax = 360.0;
    var distanceMin = 360.0;
    var height = 120;
    var closeEnoughLimit = 10.0;
    var maxTargetMovement = 1;

    //how many frames has the target been moving at fullspeed
    var maxFullSpeedCount = 5;

    var heightVector = new THREE.Vector3(0, height, 0);
    var targetOffset = new THREE.Vector3(0, 100, 0);

    var targetPos = this.targetObject.getWorldPosition();
    targetPos.add(targetOffset);

    var targetDirection = this.targetObject.getWorldDirection();
    var idealCamPos = targetDirection.multiplyScalar(-distanceMin)
      .add(targetPos)
      .add(heightVector);

    var velocity = new THREE.Vector3().subVectors(idealCamPos, this.position);
    var speed = followSpeed;
    velocity.normalize();
    velocity.multiplyScalar(followSpeed);
    var newPos = new THREE.Vector3().addVectors(this.position, velocity);
    var currentDist = newPos.distanceTo(idealCamPos);

    //is the target moving a lot?
    var targetMovementChange = this.targetObject.getWorldPosition().distanceTo(this.lastTargetPos);
    if (targetMovementChange > maxTargetMovement) {
      this.fullSpeedCount++;
    }
    else {
      this.fullSpeedCount = 0;
    }

    //If the target is moving at full speed for a while 
    //don't animate just lock on to the target
    if (this.fullSpeedCount > maxFullSpeedCount && this.closeEnough) {
      var look: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
      var right: THREE.Vector3 = new THREE.Vector3(1, 0, 0);
      var up: THREE.Vector3 = new THREE.Vector3(0, 1, 0);

      look = look.subVectors(this.position, targetPos);
      look.normalize();
      right.crossVectors(up, look);
      right.normalize();
      up.crossVectors(look, right);
      up.normalize();

      this.lookatForCamera(right, up, look, idealCamPos);

      //not moving at full speed animate the camera
    } else if (currentDist > closeEnoughLimit) {

      var look: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
      var right: THREE.Vector3 = new THREE.Vector3(1, 0, 0);
      var up: THREE.Vector3 = new THREE.Vector3(0, 1, 0);

      look = look.subVectors(this.position, targetPos);
      look.normalize();
      right.crossVectors(up, look);
      right.normalize();
      up.crossVectors(look, right);
      up.normalize();

      this.lookatForCamera(right, up, look, newPos);
      this.closeEnough = false;

    } else {
      this.closeEnough = true;
    }

    this.lastTargetPos = this.targetObject.getWorldPosition();

  }

  public windowResize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  public characterMove(character: GAME.Character) {/*nop*/ }    

  private updateCamera(): void {

    if (this.angle.x > this.TwoPi)
      this.angle.x += -this.TwoPi;

    if (this.angle.x < -this.TwoPi)
      this.angle.x += this.TwoPi;

    if (this.angle.y > this.TwoPi)
      this.angle.y += -this.TwoPi;

    if (this.angle.y < -this.TwoPi)
      this.angle.y += this.TwoPi;

    var look: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
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

}
