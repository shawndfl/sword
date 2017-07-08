import * as DATA from '../game-engine/data';
import * as THREE from 'three';

export class ModelLoader {

   private mixer: THREE.AnimationMixer;

   public loadModelJson(pathToJson: string, onLoad, onProgress?, onError?): void {
      var loader = new THREE.FileLoader();

      // Cannot use json because the onLoad method expects a string 
      // and making this json will return an object.
      loader.setResponseType('text'); 
      loader.load(pathToJson, (json) => {
         let model: DATA.Model = JSON.parse(json);
         var mesh: THREE.Mesh = this.loadModel(model);
         onLoad(mesh);
      }, onProgress, onError);
   }

   public loadModel(model: DATA.Model): THREE.Mesh {

      // Just using one for now.
      var node: DATA.Node = model.nodes[0];

      // Load geometry
      var geometry = new THREE.BufferGeometry();
      geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(node.faces), 1));
      geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(node.vertices), 3));
      geometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(node.tex1), 2));
      geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(node.normals), 3));
      var matId = node.matId;

      // Set material
      var textue = model.materials[matId].diffusedTex;
      var diffused = new THREE.TextureLoader().load(textue);
      diffused.wrapS = THREE.RepeatWrapping;

      var basic = new THREE.MeshPhongMaterial();
      var color = model.materials[matId].diffusedCol;
      basic.color = new THREE.Color(color[0], color[1], color[2]);
      
      basic.shininess = 1.0;
      basic.specular = new THREE.Color(1.0, 1.0, 1.0);      
      basic.transparent = true;
      basic.map = diffused;
      basic.wireframe = false;

      var mesh = new THREE.Mesh(geometry, basic);

      // Set transformation
      mesh.position.x = node.translation[0];
      mesh.position.y = node.translation[1];
      mesh.position.z = node.translation[2];

      mesh.scale.x = node.scale[0];
      mesh.scale.y = node.scale[1];
      mesh.scale.z = node.scale[2];

      mesh.quaternion.x = node.rotation[0];
      mesh.quaternion.y = node.rotation[1];
      mesh.quaternion.z = node.rotation[2];
      mesh.quaternion.w = node.rotation[3];

      // Load animations            
      this.loadAnimation(model.clip, mesh);      
      
      return mesh;

   }

   private loadAnimation(clip: DATA.AnimationClip, root): void {

      var tracks = new Array<THREE.KeyframeTrack>();
      for(let track of clip.tracks)
      {
         var animationTrack = new THREE.KeyframeTrack(track.name, track.times, track.values, THREE.InterpolateLinear);
         tracks.push(animationTrack);
      }

      var animationClip: THREE.AnimationClip = new THREE.AnimationClip(clip.name, clip.duration, tracks);

      this.mixer = new THREE.AnimationMixer(root);      
      var action: THREE.AnimationAction = this.mixer.clipAction(animationClip);

      action.setEffectiveTimeScale(-1);
      action.loop = true;
      action.setLoop(THREE.LoopPingPong, Infinity);
      action.play();
   }

   public update(delta: number) {
      if (this.mixer != undefined)
         this.mixer.update(delta);
   }

}