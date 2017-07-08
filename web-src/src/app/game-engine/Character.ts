import * as THREE from 'three';

export class Character {

   public head: THREE.Mesh;

   public body: THREE.Mesh;

   public rarm: THREE.Mesh;
   public larm: THREE.Mesh;

   public rsholder: THREE.Mesh;
   public lsholder: THREE.Mesh;

   public rleg: THREE.Mesh;
   public lleg: THREE.Mesh;


   public root: THREE.Object3D;

   public buildCharacter() {
      this.root = new THREE.Object3D();
      this.buildHead();
      this.buildArms();
      this.buildSholders();
      this.buildLegs();
      this.buildBody();

      // Position all parts 
      this.head.position.set(0, 95, 0);
      this.head.scale.set(20, 20, 15 );

      this.body.position.set(0, 60, 0);
      this.body.scale.set(30, 30, 15 );
      
      this.lsholder.position.set(35, 75, 0);
      this.lsholder.scale.set(20, 10, 15);
      
      this.rsholder.position.set(-35, 75, 0);      
      this.rsholder.scale.set(20, 10, 15); 

      this.larm.position.set(45, 40, 0);
      this.larm.scale.set(20, 20, 20);

      this.rarm.position.set(-45, 40, 0);
      this.rarm.scale.set(20, 20, 20);            

      this.lleg.position.set(15, 15, 0);
      this.lleg.scale.set(20, 30, 20); 

      this.rleg.position.set(-15, 15, 0);
      this.rleg.scale.set(20, 30, 20); 

   }

   private buildHead() {

      // Set material
      var textue = "assets/face.png";
      var diffused = new THREE.TextureLoader().load(textue);
      diffused.wrapS = THREE.RepeatWrapping;

      var material = new THREE.MeshPhongMaterial();
      material.color = new THREE.Color(1.0, 1.0, 1.0);

      material.shininess = 100.0;
      material.specular = new THREE.Color(1.0, 1.0, 1.0);
      material.transparent = true;
      material.map = diffused;
      material.wireframe = false;

      var geo: THREE.BufferGeometry = this.buildCube();
      this.head = new THREE.Mesh(geo, material);     

      // Add to root 
      this.root.add(this.head);            

   }

   private buildArms() {

      // Set material
      var textue = "assets/face.png";
      var diffused = new THREE.TextureLoader().load(textue);
      diffused.wrapS = THREE.RepeatWrapping;

      var material = new THREE.MeshBasicMaterial();
      material.color = new THREE.Color(0.5, 0.0, 0.0);

      material.transparent = true;
      //material.map = diffused;
      material.wireframe = false;

      var geo: THREE.BufferGeometry = this.buildCube();

      this.rarm = new THREE.Mesh(geo, material);
      this.larm = new THREE.Mesh(geo, material);

      // Add to root        
      this.root.add(this.larm);
      this.root.add(this.rarm);
      //console.log(" position.x = " + this.head.position.x);
   }

   private buildSholders() {

      // Set material
      var textue = "assets/face.png";
      var diffused = new THREE.TextureLoader().load(textue);
      diffused.wrapS = THREE.RepeatWrapping;

      var material = new THREE.MeshBasicMaterial();
      material.color = new THREE.Color(0.7, 0.0, 0.0);

      material.transparent = true;
      //material.map = diffused;
      material.wireframe = false;

      var geo: THREE.BufferGeometry = this.buildCube();

      this.rsholder = new THREE.Mesh(geo, material);
      this.lsholder = new THREE.Mesh(geo,material);
      
      // Add to root 
      this.root.add(this.lsholder);
      this.root.add(this.rsholder);      
   }

   private buildLegs() {
      // Set material
      var textue = "assets/face.png";
      var diffused = new THREE.TextureLoader().load(textue);
      diffused.wrapS = THREE.RepeatWrapping;

      var material = new THREE.MeshBasicMaterial();
      material.color = new THREE.Color(0.5, 0.0, 0.0);

      material.transparent = true;
      //material.map = diffused;
      material.wireframe = false;

      var geo: THREE.BufferGeometry = this.buildCube();

      this.lleg = new THREE.Mesh(geo, material);
      this.rleg = new THREE.Mesh(geo, material);      

      // Add to root              
      this.root.add(this.lleg);
      this.root.add(this.rleg);
   }

   private buildBody() {

      // Set material
      var textue = "assets/face.png";
      var diffused = new THREE.TextureLoader().load(textue);
      diffused.wrapS = THREE.RepeatWrapping;

      var material = new THREE.MeshPhongMaterial();
      material.color = new THREE.Color(0.0, 0.7, 0.0);

      material.shininess = 100.0;
      material.specular = new THREE.Color(1.0, 1.0, 1.0);
      material.transparent = true;
      //material.map = diffused;
      material.wireframe = false;

      var geo: THREE.BufferGeometry = this.buildCube();
      this.body = new THREE.Mesh(geo, material);     

      // Add to root 
      this.root.add(this.body);          
   }


   private buildCube(): THREE.BufferGeometry {

      var vertices = [
         -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,            //front
         0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5,            //Left
         0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5,        //Back
         -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5,        //Right
         -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,            //Top
         -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5         //Bottom
      ];

      var normals = [
         0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
         1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
         0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
         -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
         0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
         0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0
      ];

      var tex1 = [
         0.25, 0.75, 0.50, 0.75, 0.50, 0.50, 0.25, 0.50,
         0.50, 0.75, 0.75, 0.75, 0.75, 0.50, 0.50, 0.50,
         0.75, 0.75, 1.00, 0.75, 1.00, 0.50, 0.75, 0.50,
         0.00, 0.75, 0.25, 0.75, 0.25, 0.50, 0.00, 0.50,
         0.25, 1.00, 0.50, 1.00, 0.50, 0.75, 0.25, 0.75,
         0.25, 0.50, 0.50, 0.50, 0.50, 0.25, 0.25, 0.25
      ];

      var faces = [
         0, 3, 1, 1, 3, 2,                   //Front
         4, 7, 5, 7, 6, 5,                   //Left
         8, 11, 9, 11, 10, 9,                //Right
         12, 15, 13, 15, 14, 13,
         16, 19, 17, 19, 18, 17,
         20, 23, 21, 23, 22, 21
      ]

      // Load geometry
      var geometry = new THREE.BufferGeometry();
      geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(faces), 1));
      geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
      geometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(tex1), 2));
      geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));

      return geometry;
   }
}
