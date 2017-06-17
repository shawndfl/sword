import * as DATA from '../game-engine/data';
import * as THREE from 'three';

export class ModelLoader {

   public loadModelJson(json: string, onLoad, onProgress?, onError?): void {
      var loader = new THREE.FileLoader();

      loader.setResponseType('json');
      loader.load('assets/test-model.json', (json) => {
         var model: DATA.Model = JSON.parse(json);
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
      var matId = node.matId;

      // Set material
      var basic = new THREE.MeshBasicMaterial();
      var color = model.materials[matId].diffusedCol;
      basic.color = new THREE.Color(color[0], color[1], color[2]);
      basic.wireframe = false;

      var mesh = new THREE.Mesh(geometry, basic);     

      // Load Transformation
      mesh.matrix.identity();
      
      mesh.matrix.elements[0] = node.scale[0];
      mesh.matrix.elements[5] = node.scale[1];
      mesh.matrix.elements[10] = node.scale[2];      

      mesh.matrix.elements[12] = node.translation[0];
      mesh.matrix.elements[13] = node.translation[1];
      mesh.matrix.elements[14] = node.translation[2];

      var rotMat = new THREE.Matrix4();
      rotMat.makeRotationFromQuaternion(new THREE.Quaternion(node.rotation[0], node.rotation[1], node.rotation[2], node.rotation[3]));

      mesh.matrix.multiply(rotMat);
      mesh.matrixAutoUpdate = false;

      // TODO Load Animation 
      //var trackData = node.clip.tracks[0];

      //var track = ([new THREE.KeyframeTrack(trackData.name, trackData.times, trackData.values, trackData.interpolation)]);
      //var clip : THREE.AnimationClip = new THREE.AnimationClip("none", node.clip.duration, track);

      //var mixer: THREE.AnimationMixer = new THREE.AnimationMixer(mesh);
      
      //var action: THREE.AnimationAction = mixer.
      return mesh;

   }

}