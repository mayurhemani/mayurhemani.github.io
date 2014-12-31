var gd = {
	renderer: null,
	camera: null,
	scene: null,
	view_params: {
		width: 0,
		height: 0,
		aspect: 0,
		near: 0.1,
		far: 10000,
		fov: 45
	},
	controls: null,
	imgMan: null,
	projector: null,
	mouseVector: null,
	spheres: null
};


var ImageManip = (function() {
		
	
		var kMeansClustering = (function() {

			function genRandom(K, dims) {
				var result = [];
				var i, j;
				for (i = 0; i < K; ++i) {
					result[i] = {
							points: [],
							value:  new Array(dims.count),
							err: new Array(dims.count)
						};
					for (j = 0; j < dims.count; ++j) {
						result[i].value[j] = dims.limits[j].min + Math.random() * dims.limits[j].range;
						result[i].err[j] = 1000;
					}
				}
				return result;
			}

			function euclidean(pointA, pointB) {
				var i = 0, dist = 0, diff = 0;
				for (; i < pointA.length; ++i) {
					diff = (pointB[i] - pointA[i]);
					dist += diff*diff;
				}
				return Math.sqrt(dist);
			}

			function assign(points, centroids, distance) {
				var i, j, k = centroids.length, asgn = 0, mindist = 0, dist;

				for (i = 0; i < k; ++i) {
					centroids[i].points = [];
				}

				for (i = 0; i < points.length; ++i) {
					asgn = 0;
					mindist = distance(points[i], centroids[0].value);
	
					for (j = 1; j < k; ++j) {
						dist = distance(points[i], centroids[j].value);
						if (dist < mindist)  {
							mindist = dist;
							asgn = j;
						}
					}
					centroids[asgn].points.push({index: i, weight: mindist});
				}

				return centroids;
			}

			function recompute(points, centroids) {
				var point, i, j, k;
				var numPoints, numCentroids = centroids.length, numDims;
				var centroid, newCentroid, denom = 0;

				for ( i = 0; i < numCentroids; ++i ) {
					centroid = centroids[i];
					numDims = centroid.value.length;
					newCentroid = new Array(numDims);
					for ( k = 0; k < numDims; ++k ) { newCentroid[k] = 0;}
					
					numPoints = centroid.points.length;
					denom = 0;
					for ( j = 0; j < numPoints; ++j ){
						denom += centroid.points[j].weight;
					}

					for ( j = 0; j < numPoints; ++j) {
						point = points[centroid.points[j].index];
						for ( k = 0; k < numDims; ++k) {
							newCentroid[k] += centroid.points[j].weight * point[k];
						}
					}

					if (denom > 0) {
						for (k = 0; k < numDims; ++k) {
							var err = centroids[i].value[k];
							centroids[i].value[k] = newCentroid[k] / denom;
							centroids[i].err[k] = Math.abs(err -  centroids[i].value[k]);
						}
					}
				}
				return centroids;
			}

			function computeError(centroids)
			{
				var err = 0;
				var nerr = 0;
				var i, j, numCentroids = centroids.length;
				var numDims = 3;

				for (i = 0; i < numCentroids; ++i) {
					nerr = 0;
					for (j = 0; j < numDims; ++j) {
						nerr += centroids[i].err[j];
					}
					err += nerr / numDims;
				}
				return err/numCentroids;
			}
			
			return function(K, points, dims) {
				centroids = genRandom(K, dims);

				for (var i = 0; i < 100; ++i) {
					centroids = assign(points, centroids, euclidean);
					centroids = recompute(points, centroids, dims);
					var err = computeError(centroids);
					if (err < 0.01) { break; }
				}

				
				this.getCentroids = function() { return centroids; };
			};
		})();

		var ColorConvert = (function() {
				var _rgb = {r : { min : 0, max : 255}, g : { min : 0, max : 255}, b : {min : 0, max : 255}},
				_xyz = { x : { min : 0, max : 95.047 }, y : {min : 0, max : 100 }, z : { min : 0, max : 108.883} },
				_lab = { l : { min: 0, max: 100}, a: { min: -127, max: 128}, b: { min: -127, max: 128 }},
				_white = [95.047, 100.000, 108.883];
			
				var after = 3;	
				var reg = new RegExp('^([-\\d]*)(\\.\\d{1,' + after + '})?.*');

				function _round(num) {
					num += '';
					num = num.replace(reg, '$1$2');
					num -= 0;
					return num;
				}

				function _rgb2xyz(raw) {
					var tmp  = '',
					loop = '',
					rgb  = {
						r : raw[0] / 255,
						g : raw[1] / 255,
						b : raw[2] / 255
					},
					xyz  = null;

					for (loop in rgb) {
						if (rgb[loop] > 0.04045) {
							rgb[loop] = Math.pow(((rgb[loop] + 0.055) / 1.055), 2.4);
						} else {
							rgb[loop] /= 12.92;
						}
						rgb[loop] = rgb[loop] * 100;
					}

					xyz = [
						_round(rgb.r * 0.4124 + rgb.g * 0.3576 + rgb.b * 0.1805),
						_round(rgb.r * 0.2126 + rgb.g * 0.7152 + rgb.b * 0.0722),
						_round(rgb.r * 0.0193 + rgb.g * 0.1192 + rgb.b * 0.9505)
					];

					return xyz;
				}

				
				function _xyz2lab(raw) {
					 var loop  = '',
					    xyz   = [0, 0, 0];

					for (loop = 0; loop < 3; ++loop) {
					    xyz[loop] = raw[loop] / _white[loop];
					    if (xyz[loop] > 0.008856) {
						xyz[loop] = Math.pow(xyz[loop], 1 / 3);
					    } else {
						xyz[loop] = (7.787 * xyz[loop]) + (16 / 116);
					    }
					}

					return [
					    116 * xyz[1] - 16,
					    500 * (xyz[0] - xyz[1]),
					    200 * (xyz[1] - xyz[2])
					];
				}

				function _rgb2lab(rgb_raw) {
					return _xyz2lab( _rgb2xyz(rgb_raw) );
				}

				function _lab2xyz(raw) {
					var loop  = 0,
					    powed = 0,
					    xyz   = [0, 0, 0];

					xyz[1] = (raw[0] + 16) / 116.0;
					xyz[0] = raw[1] / 500.0 + xyz[1]
					xyz[2]= xyz[1] - raw[2] / 200.0;

					for (loop=0; loop < 3; ++loop) {

					    if (powed > 0.008856) {
							xyz[loop] = Math.pow(xyz[loop], 3);
					    } else {
							xyz[loop] = (xyz[loop] - 16 / 116.0 ) / 7.787;
					    }

					    xyz[loop] = _round(xyz[loop] * _white[loop]);
					}

					return xyz;
				}

				function _xyz2rgb(raw) {
					var loop = 0,
					    xyz  = [
							raw[0] / 100.0,
							raw[1] / 100.0,
							raw[2] / 100.0
					    ];
					    rgb  = [0, 0, 0];

					rgb[0]= xyz[0] * 3.2406 + xyz[1] * -1.5372 + xyz[2] * -0.4986;
					rgb[1]= xyz[0] * -0.9689 + xyz[1] * 1.8758 + xyz[2] * 0.0415;
					rgb[2]= xyz[0] * 0.0557 + xyz[1] * -0.2040 + xyz[2] * 1.0570;

					var cc = 0;
					for (loop=0; loop<3; ++loop) {
					    cc = _round(rgb[loop]);

					    if (cc > 0.0031308) {
							cc = 1.055 * Math.pow(cc, (1 / 2.4)) - 0.055;
						} else {
							cc *= 12.92;
					    }

					    rgb[loop] = parseInt(cc * 255);
					}
					return rgb
				}

				function _lab2rgb(raw) {
					return _xyz2rgb( _lab2xyz( raw ) );
				}



				return {
					rgb2lab: _rgb2lab,
					lab2rgb: _lab2rgb	
				};

		})();



		var PixelManip = (function() {
		
			var rgbPixelData;
		   	var labPixelData;
			var imgW, imgH;
			
			function storeLAB(w, h) {
				var i = 0, j = 0, pos = 0, k  = 0;
				var data = rgbPixelData.data, lab;
				labPixelData = new Array(w * h);

				for ( i = 0; i < h; ++i) {
					for ( j = 0; j < w; ++j ) {
						pos = i * w * 4 + j * 4;
						lab = ColorConvert.rgb2lab([data[pos], data[pos+1], data[pos+2]]);
						pos = i*w + j;
						labPixelData[pos] = lab;
					}
				}
			}	

			function _shiftLab(indices, shift) {
				var i = 0, j = 0, pos = 0, k  = 0;
				var data = rgbPixelData.data, lab;
				var r, c, rgb;

				for (i = 0, k = indices.length; i < k; ++k) {
					r = parseInt( k / imgW );
					c = k - r * imgW;
					lab = labPixelData[indices[i]];
					lab[0] += shift.l;
					lab[1] += shift.a;
					lab[2] += shift.b;
					labPixelData[indices[i]] = lab;
					rgb = ColorConvert.lab2rgb(lab);
					pos = r*imgW*4 + c*4;
					rgbPixelData[pos] = rgb[0];
					rgbPixelData[pos+1] = rgb[1];
					rgbPixelData[pos+2] = rgb[2];
				}

			}	

			return function (imgData, w, h) {
				rgbPixelData = imgData;
				imgW = w;
				imgH = h;
				storeLAB(w, h);
				this.shiftLab = _shiftLab;
				this.getImgData = function() { return rgbPixelData; };
				this.getLabData = function() { return labPixelData; };
			};
		})();


		var kmeans, pixmanip, pixels, 
			data_dimensions = {
					count: 3,
					limits: [
						{min: 0, max: 100, range: 50},
						{min: 0, max:128, range: 50},
						{min: 0, max:128, range: 50}
					]
			},
		graphicContext;

		
		function _getCenterPoints() {
			return kmeans.getCentroids();
		}


		function _shiftClusterPoint(pointIndices, shift) {
			return pixmanip.shiftLab(pointIndices, shift);
		}	

		function _redrawImage() {
			var d = pixmanip.getImgData();
			graphicsContext.putImageData(d, 0, 0);
		}
		
		return function(cg, img, w, h) {
			cg.drawImage(img, 0, 0);
			graphicsContext = cg;


			pixmanip = new PixelManip(cg.getImageData(0, 0, w, h), w, h);
			pixels = pixmanip.getLabData();
			kmeans = new kMeansClustering(5, pixels, data_dimensions);

			// public functions
			this.getClusterPoints = _getCenterPoints;
			this.shiftClusterPoint = _shiftClusterPoint;
			this.redrawImage = _redrawImage;
			this.clrConverter = ColorConvert;
		};
})();


function init2DCanvas(imgID, canvasID)
{
	var img = document.getElementById(imgID);
	var cv = document.getElementById(canvasID);

	cv.width = parseInt(img.width);
	cv.height = parseInt(img.height);

	var cg = cv.getContext('2d');
	
	gd.imgManipulator = new ImageManip(cg, img, cv.width, cv.height);
		
}

function init3DCanvas(container, params)
{
	var cont = $(container);
	gd.renderer = new THREE.WebGLRenderer();

	if (params) {	
		gd.view_params.width = (params.width) ? params.width : 640;
		gd.view_params.height = (params.height) ? params.height : 512;
		gd.view_params.aspect = gd.view_params.width / gd.view_params.height;
		if (params.near) gd.view_params.near = params.near;
		if (params.far) gd.view_params.far = params.far;
		if (params.fov) gd.view_params.fov = params.fov;
	} else {
		gd.view_params.width = 640;
		gd.view_params.height = 512;
		gd.view_params.aspect = gd.view_params.width / gd.view_params.height;
	}

	gd.camera = new THREE.PerspectiveCamera(gd.view_params.fov, gd.view_params.aspect, gd.view_params.near, gd.view_params.far);
	gd.scene = new THREE.Scene();
	gd.scene.add(gd.camera);
	gd.camera.position.z =  300; // (params.cameraZPosition) ? params.cameraZPosition: 300;
	gd.renderer.setSize(gd.view_params.width, gd.view_params.height);

	// add a basic light
	var pointLight = new THREE.PointLight(0xFFFFFF);
	pointLight.position.x = 10;
	pointLight.position.y = 50;
	pointLight.position.z = 200;
	gd.scene.add(pointLight);


	cont.append(gd.renderer.domElement);
	
	gd.controls = new THREE.TrackballControls(gd.camera, gd.renderer.domElement);
	gd.controls.zoomSpeed = 0.1;
	gd.controls.addEventListener('change', render);


	gd.projector = new THREE.Projector();
	gd.mouseVector = new THREE.Vector3();

	gd.renderer.domElement.addEventListener('mousedown', onMouseDown, false);
	gd.renderer.domElement.addEventListener('mouseup', onMouseUp, false);
}

function getLab2RGB(l, a, b)
{
	return gd.imgManipulator.clrConverter.lab2rgb([l, a, b]);
}

function getRGB2Lab(r, g, b)
{
	return gd.imgManipulator.clrConverter.rgb2lab([r, g, b]);
}


function initGeometry()
{
	// get all the cluster points and construct geometries accordingly
	var i;

	// draw axes
	var axisMaterial = new THREE.LineBasicMaterial({color: 0xff0000});
	var xAxisGeom = new THREE.Geometry(),
		yAxisGeom = new THREE.Geometry(),
		zAxisGeom = new THREE.Geometry();
	xAxisGeom.vertices.push(new THREE.Vector3(-100, 0, 0));
	xAxisGeom.vertices.push(new THREE.Vector3(100, 0, 0));
	yAxisGeom.vertices.push(new THREE.Vector3(0, -127, 0));
	yAxisGeom.vertices.push(new THREE.Vector3(0, 127, 0));
	zAxisGeom.vertices.push(new THREE.Vector3(0, 0, -127));
	zAxisGeom.vertices.push(new THREE.Vector3(0, 0, 127));
	gd.scene.add(new THREE.Line(xAxisGeom, axisMaterial));
	gd.scene.add(new THREE.Line(yAxisGeom, axisMaterial));
	gd.scene.add(new THREE.Line(zAxisGeom, axisMaterial));

	// a sphere for each centroid position 
	var centroids = gd.imgManipulator.getClusterPoints();
	var geom = new THREE.SphereGeometry(5, 16, 16);
	gd.spheres = new THREE.Object3D();
	gd.scene.add(gd.spheres);

	for ( i = 0; i < centroids.length; ++i ) {	

		var sphereClr = getLab2RGB(centroids[i].value[0], centroids[i].value[1], centroids[i].value[2]);
		sphereClr = [parseInt(sphereClr[0]), parseInt(sphereClr[1]), parseInt(sphereClr[2])];

		var sphereMaterial = new THREE.MeshLambertMaterial({
										color: (sphereClr[0] << 16) | (sphereClr[1] << 8) | (sphereClr[2])
									});

		var mesh = new THREE.Mesh(geom, sphereMaterial);

		var xx = centroids[i].value[0], 
			yy = centroids[i].value[1],
			zz = centroids[i].value[2];
		mesh.position.set( yy, xx, zz );
		
		gd.spheres.add(mesh);
	}


	// add LAB particles
	var particles = new THREE.Geometry();
	var partcolors = [];
	for (var l = 0; l < 256; l+=4) {
		for (var a = 0; a < 256; a+=4) {
			for (var b = 0; b < 256; b+=4) {
				// clr = getLab2RGB(l, a, b);
				clr = getRGB2Lab(l, a, b);
				var partclr = new THREE.Color();
				partclr.setRGB(l/255.0, a/255.0, b/255.0);
				partcolors.push(partclr);

				var p = new THREE.Vector3(clr[1], clr[0], clr[2]);
				particles.vertices.push(p);
			}
		}
	}

	particles.colors = partcolors;

	var particleMat = new THREE.PointCloudMaterial({ size: 2, opacity: 0.4, vertexColors: THREE.VertexColors, transparent: true} );

	var psystem = new THREE.PointCloud(particles, particleMat);
	gd.scene.add(psystem);
}


gd.drag = {
	cur: null,
	clickState: false,
	curX: 0,
	curY: 0
};


function onMouseDown( e ) {
/*
	var x = e.pageX - $(e.target).offset().left;
	var y = e.pageY - $(e.target).offset().top;
	gd.mouseVector.x = 2 * (x / gd.view_params.width) - 1.0;
	gd.mouseVector.y = 1 - 2 * ( y / gd.view_params.height );

	var raycaster = gd.projector.pickingRay( gd.mouseVector.clone(), gd.camera ),
		intersects = raycaster.intersectObjects( gd.spheres.children );

	// gray
	gd.spheres.children.forEach(function( sphere ) {
			sphere.material.color.setRGB( 0.9, 0.9, 0.9 );
	});

	for( var i = 0; i < intersects.length; i++ ) {
		var intersection = intersects[ i ],
			obj = intersection.object;
		obj.material.color.setRGB( 1.0, 0.0, 0.0 );
	}
	if (intersects.length == 1) {
		gd.drag.cur = intersects[0].object;
		gd.drag.clickState = true;
		gd.drag.curX = x;
		gd.drag.curY = y;
	}
*/
}


function onMouseUp(e) {
/*	var x = e.pageX - $(e.target).offset().left;
	var y = e.pageY - $(e.target).offset().top;

	if (gd.drag.clickState) {
		var vec = new THREE.Vector3();
		vec.x = 2 * (x / gd.view_params.width) - 1.0;
		vec.y = 1 - 2 * ( y / gd.view_params.height );

		// un-project both points
		var pos = gd.projector.unprojectVector(vec, gd.camera);
		if (gd.drag.cur) {
			gd.drag.cur.position.x = pos.x;
			gd.drag.cur.position.y = pos.y;
			gd.drag.cur.position.z = pos.z;

			gd.drag.cur = null;
		}
	}
	*/
}

function onMouseMove( e ) 
{
	var x = e.pageX - $(e.target).offset().left;
	var y = e.pageY - $(e.target).offset().top;
	if (gd.drag.clickState) {
		
	}
}



function render()
{
	gd.renderer.render(gd.scene, gd.camera);
}

function animate()
{
	requestAnimationFrame(animate);
	gd.controls.update();
}
function log(str)
{
	(document.getElementById("status")).innerHTML = str;
}


function drive()
{

	log("Initializing canvas");
	init2DCanvas("srcImg", "cv");
	document.getElementById("srcImg").style.display = "none";
	log("Initializing 3D visualization");
	init3DCanvas(document.getElementById("manip"));
	log("Loading geometry from image");
	initGeometry();
	log("Started");
	render();
	animate();
}
