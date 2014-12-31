var Kolor = (function() {
	function rgb2XYZ(r, g, b) {
		var v_r = r / 255.0, v_g = g / 255.0, v_b = b / 255.0;

		if ( v_r > 0.04045 ) v_r = Math.pow( (( v_r + 0.055 ) / 1.055), 2.4 );
		else                 v_r /= 12.92;
		if ( v_g > 0.04045 ) v_g = Math.pow( (( v_g + 0.055 ) / 1.055), 2.4 );
		else                 v_g /= 12.92;
		if ( v_g > 0.04045 ) v_b = Math.pow( (( v_b + 0.055 ) / 1.055), 2.4 );
		else                 v_b /= 12.92;

		v_r = v_r* 100
		v_g = v_g * 100
		v_b = v_b * 100

		//Observer. = 2°, Illuminant = D65
		return {
			x: v_r * 0.4124 + v_g * 0.3576 + v_b * 0.1805,
			y: v_r * 0.2126 + v_g * 0.7152 + v_b * 0.0722,
			z: v_r * 0.0193 + v_g * 0.1192 + v_b * 0.9505
		};
	}

	function xyz2LAB(x, y, z) {
		var v_x = x / 95.047,
			v_y = y / 100.0,
			v_z = z / 108.883;

		if (v_x > 0.008856) { v_x = Math.pow(v_x, 1/3.0); }
		else { v_x = (7.787 * v_x) + (16 / 116.0); }
		if (v_y > 0.008856) { v_y = Math.pow(v_y, 1/3.0); }
		else { v_y = (7.787 * v_y) + (16 / 116.0); }
		if (v_z > 0.008856) { v_z = Math.pow(v_z, 1/3.0); }
		else { v_z = (7.787 * v_z) + (16 / 116.0); }

		return {
			l: (116 * v_y) - 16.0,
		  	a: 500.0 * (v_x - v_y),
		  	b: 200.0 * (v_y - v_z)
		};
	}

	function lab2XYZ(l, a, b) {
		var v_y = (l + 16.0) / 116.0,
			v_x = a / 500.0 + v_y,
			v_z = v_y - b / 200.0;

		var vv_x = v_x * v_x * v_x,
			vv_y = v_y * v_y * v_y,
			vv_z = v_z * v_z * v_z;

		if (vv_x > 0.008856) { v_x = vv_x; } else { v_x = (v_x - 16.0/116) / 7.787; }
		if (vv_y > 0.008856) { v_y = vv_y; } else { v_y = (v_y - 16.0/116) / 7.787; }
		if (vv_z > 0.008856) { v_z = vv_z; } else { v_z = (v_z - 16.0/116) / 7.787; }
		return {
	x: v_x * 95.047,
		   y: v_y * 100.0,
		   z: v_z * 108.883
		};
	}

	function xyz2RGB(x, y, z) {
		var var_X = x / 100,
			var_Y = y / 100,        //Y from 0 to 100.000
			var_Z = z / 100 ;       //Z from 0 to 108.883

		var_R = var_X *  3.2406 + var_Y * -1.5372 + var_Z * -0.4986;
		var_G = var_X * -0.9689 + var_Y *  1.8758 + var_Z *  0.0415;
		var_B = var_X *  0.0557 + var_Y * -0.2040 + var_Z *  1.0570;

		if ( var_R > 0.0031308 ) var_R = 1.055 * Math.pow(var_R, (1/2.4))- 0.055;
		else                     var_R = 12.92 * var_R;
		if ( var_G > 0.0031308 ) var_G = 1.055 * Math.pow(var_G, (1/2.4)) - 0.055;
		else                     var_G = 12.92 * var_G;
		if ( var_B > 0.0031308 ) var_B = 1.055 * Math.pow(var_B, (1/2.4)) - 0.055;
		else                     var_B = 12.92 * var_B;

		return {
			r: var_R * 255,
			g: var_G * 255,
			b: var_B * 255 
		};
	}

	return {
		rgb2Lab: function(r, g, b) {
			 var a = rgb2XYZ(r, g, b);
			 return xyz2LAB(a.x, a.y, a.z);
		 },
		lab2Rgb: function(l, a, b) {
			 var x = lab2XYZ(l, a, b);
			 return xyz2RGB(x.x, x.y, x.z);
		 }
	};
})();

var gg = (function(container) {

		var renderer;
		var scene;
		var camera;
		var particles;

		var twopi = Math.PI * 2;
		function _drawParticle(context) {
			context.beginPath();
			context.arc(0, 0, 0.5, 0, twopi, true);
			context.fill();
		}

		function _init() {

			// create renderer
			renderer = new THREE.CanvasRenderer();
			renderer.setSize(512, 512);

			// create scene
			scene = new THREE.Scene();

			// add camera
			camera = new THREE.PerspectiveCamera(45, 4/3, 0.1, 10000);
			scene.add(camera);
			camera.position.z = 300;

			// add light
			var pointLight = new THREE.PointLight(0xFFFFFF);
			pointLight.position.x = 10;
			pointLight.position.y = 50;
			pointLight.position.z = 130;
			scene.add(pointLight);

			// add the renderer to the page
			$("#" + container).append(renderer.domElement);

			var globalScale = 0.5;
			particles = new THREE.Object3D();
			scene.add(particles);
		}

		function _createParts(colorimg, img, w, h) {
			var i, j;
			var particle, pos;
			for (i = 0; i < h; ++i) {
				for (j = 0; j < w; ++j) {
					pos = i*w*4 + j*4;
					var material = new THREE.SpriteCanvasMaterial({
								color: ((colorimg[pos] << 16) & (colorimg[pos+1] << 8) & (colorimg[pos+2])),
								program: drawParticle
							});
					var cpos = i*w + j;
					var x = img[cpos].l,
						y = img[cpos].a,
						z = img[cpos].b;
					particle = new THREE.Sprite( material );
					particle.position.x = x - 50;
					particle.position.y = y - 50;
					particle.position.z = 0;
					particles.add(particle);
				}
			}
		}


		function _render() {
			camera.lookAt(scene.position);
			renderer.render(scene, camera);
		}
		
		function _begin() {
			requestAnimationFrame( _begin );
			// update things here...
			_render();
			
		}

		return {
			init: _init,
			createParticles: _createParts,
			begin: _begin
		};


})("fraccont");
