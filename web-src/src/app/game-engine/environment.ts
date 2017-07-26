
import * as THREE from 'three';
import * as DATA from '../game-engine/data';
import * as G from '../game-engine/graphics';

export class Environment {
   private ready: boolean = false;
   private root: THREE.Object3D;
   private graphics: EnvornmentGraphics;

   public initialize(scene: THREE.Scene) {
      var loader = new THREE.FileLoader();      
      this.graphics = new EnvornmentGraphics();
      this.graphics.loadModelJson(scene, "../assets/environment.json", (envData: DATA.Terrain)=>{

         this.ready = true;
      });

   }

   public update(delta: number) {
      if (this.ready) {

      }
   }

   private buildFromData() {

   }
}

class EnvornmentGraphics {
   public root: THREE.Object3D;

   /**
     * Loads the meshes, animations, and textures from a json file.
     * @param scene 
     * @param pathToJson 
     * @param onLoad 
     * @param onProgress 
     * @param onError 
     */
    public loadModelJson(scene: THREE.Scene, pathToJson: string, onLoad?, onProgress?, onError?): void {
        var loader = new THREE.FileLoader();

        // Cannot use json because the onLoad method expects a string 
        // and making this json will return an object.
        loader.setResponseType('text');
        loader.load(pathToJson, (json) => {
            var envData: DATA.Terrain = JSON.parse(json);

            this.buildFromData(envData);
            scene.add(this.root);
            onLoad(envData);
        }, onProgress, onError);
    }

    private buildFromData(envData: DATA.Terrain ) {
        this.root = new THREE.Object3D();
        this.root.name = "terrain";

        // Set material
        var textue = envData.texture1;        
        var diffused = new THREE.TextureLoader().load(textue);
        diffused.wrapS = THREE.RepeatWrapping;
        diffused.wrapT = THREE.RepeatWrapping;        
        diffused.magFilter = THREE.NearestFilter;
        diffused.minFilter = THREE.NearestMipMapNearestFilter;

        var material = new THREE.MeshPhongMaterial();
        material.color = new THREE.Color(1.0, 1.0, 1.0);        
        material.shininess = 100.0;
        material.specular = new THREE.Color(1.0, 1.0, 1.0);
        material.transparent = false;
        material.map = diffused;

        material.wireframe = false;
        var terrain = new G.TerrainGeometry().
                     setSize(envData.terrain[0], envData.terrain[1], envData.terrain[2]  ).
                     buildTerrain();
        var geo = terrain;
        var mesh = new THREE.Mesh(geo, material);        

        this.root.add(mesh);
    }
}
