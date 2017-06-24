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
      geometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(node.tex1), 2));
      var matId = node.matId;

      // Set material
      var textue = model.materials[matId].diffusedTex;
      var diffused = new THREE.TextureLoader().load( textue );
      diffused.wrapS = THREE.RepeatWrapping;

      var basic = new THREE.MeshBasicMaterial();
      var color = model.materials[matId].diffusedCol;
      basic.color = new THREE.Color(color[0], color[1], color[2]);
      basic.map = diffused;
      basic.wireframe = false;

      var mesh = new THREE.Mesh(geometry, basic);     
      mesh.position.x = node.translation[0];
      mesh.position.y = node.translation[1];
      mesh.position.z = node.translation[2];

      mesh.scale.x = node.scale[0];
      mesh.scale.y = node.scale[1];
      mesh.scale.z = node.scale[2];

      mesh.quaternion.x =  node.rotation[0];
      mesh.quaternion.y =  node.rotation[1];
      mesh.quaternion.z =  node.rotation[2];
      mesh.quaternion.w =  node.rotation[3];      
      // Load Transformation
      //mesh.matrix.identity();
      
      //mesh.matrix.elements[0] = node.scale[0];
      //mesh.matrix.elements[5] = node.scale[1];
      //mesh.matrix.elements[10] = node.scale[2];      

      //mesh.matrix.elements[12] = node.translation[0];
      //mesh.matrix.elements[13] = node.translation[1];
      //mesh.matrix.elements[14] = node.translation[2];

      //var rotMat = new THREE.Matrix4();
      //rotMat.makeRotationFromQuaternion(new THREE.Quaternion(node.rotation[0], node.rotation[1], node.rotation[2], node.rotation[3]));

      //mesh.matrix.multiply(rotMat);
      //mesh.matrixAutoUpdate = false;

      
      return mesh;

   }

}