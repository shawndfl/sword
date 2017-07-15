import * as THREE from 'three';

function calculateUV(x: number, y: number): number[] {
   var s = 0.0625;
   return [
      x * s, 1.0 - (y * s),
      x * s + s, 1.0 - (y * s),
      x * s + s, 1.0 - (y * s + s),
      x * s, 1.0 - (y * s + s)
   ]
}

export class CubeGeometry extends THREE.BufferGeometry {

    public constructor( offset: number[],
      nx: number[],
      px: number[],
      ny: number[],
      py: number[],
      nz: number[],
      pz: number[])
    {
        super();

        var vertices = [
         -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,            //front
         0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5,            //Left
         0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5,        //Back
         -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5,        //Right
         -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,            //Top
         -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5         //Bottom
      ];

      //offset positions
      for (var i = 0; i < vertices.length; i += 3) {
         vertices[i] += offset[0];
         vertices[i + 1] += offset[1];
         vertices[i + 2] += offset[2];
      }

      var normals = [
         0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
         1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
         0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
         -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
         0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
         0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0
      ];

      var tex1 = [];
      calculateUV(pz[0], pz[1]).forEach(num => { tex1.push(num) });
      calculateUV(px[0], px[1]).forEach(num => { tex1.push(num) });
      calculateUV(nz[0], nz[1]).forEach(num => { tex1.push(num) });
      calculateUV(nx[0], nx[1]).forEach(num => { tex1.push(num) });
      calculateUV(py[0], py[1]).forEach(num => { tex1.push(num) });
      calculateUV(ny[0], ny[1]).forEach(num => { tex1.push(num) });

      var faces = [
         0, 3, 1, 1, 3, 2,                   //Front
         4, 7, 5, 7, 6, 5,                   //Left
         8, 11, 9, 11, 10, 9,                //Back
         12, 15, 13, 15, 14, 13,             //Right
         16, 19, 17, 19, 18, 17,             //Top
         20, 23, 21, 23, 22, 21              //Bottom
      ]
    
      this.setIndex(new THREE.BufferAttribute(new Uint16Array(faces), 1));
      this.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));      
      this.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(tex1), 2));
      this.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
    }
}

export class CubeMesh extends THREE.Mesh {
   private pzOffset: number = 8 * 0;
   private pxOffset: number = 8 * 1;
   private nzOffset: number = 8 * 2;
   private nxOffset: number = 8 * 3;
   private pyOffset: number = 8 * 4;
   private nyOffset: number = 8 * 5;   

   private rowCount = 16;

   get pz () : number {

        var geo: THREE.BufferGeometry = <THREE.BufferGeometry>this.geometry;
        var uvAttribute : THREE.BufferAttribute = <THREE.BufferAttribute>geo.getAttribute("uv");
        var xy = [uvAttribute.getX(this.pzOffset), uvAttribute.getY(this.pzOffset)];
        var index = xy[1] * this.rowCount + xy[1];        
        return index;
   }

   set pz(value: number)
   {       
       var x = Math.floor(value) % this.rowCount;
       var y = Math.floor(value / this.rowCount);
       //console.log("Setting pz " + value +" : " + x + ", " + y);
       var values = calculateUV(x, y);
       var geo: THREE.BufferGeometry = <THREE.BufferGeometry>this.geometry;
       var uvAttribute : THREE.BufferAttribute = <THREE.BufferAttribute>geo.getAttribute("uv");
       uvAttribute.needsUpdate = true;
       uvAttribute.set(values, this.pzOffset);
   }
   
   public constructor(geometry: CubeGeometry, material: THREE.Material) {      
      super(geometry, material);
   }
}