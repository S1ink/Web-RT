function makeGeneric(scene) {
	scene.addSpheres(
		new Sphere(Vec3(2.1, 0.1, 2.5), 0.8, Mat(
			Vec3(1, 1, 1),
			Vec3(0, 0, 0),
			Vec3(1, 1, 1),
			Vec3(0, 0, 0),
			Vec3(1.0, 0.4, 0.4),
			0.2
		)),
		new Sphere(Vec3(0, -10, 4), 9.6, Mat(
			Vec3(1, 1, 1),
			Vec3(0, 0, 0),
			Vec3(0.7, 0.6, 0.8),
			Vec3(0, 0, 0),
			Vec3(0, 0, 0),
			0.2
		)),
		new Sphere(Vec3(0, 0.0, 2.5), 0.5, Mat(
			Vec3(2.4065, 2.4232, 2.4445),
			Vec3(0, 0, 0),
			// Vec3(1.3068, 1.3112, 1.3140),
			// Vec3(3.2510e-8, 2.1034e-9, 2.8610e-10),
			Vec3(0.0, 0.0, 0.0),
			Vec3(1.0, 1.0, 1.0),
			Vec3(0, 0, 0),
			0.01
		)),
		new Sphere(Vec3(0.5, 1.8, 4.5), 0.7, Mat(
			Vec3(1, 1, 1),
			Vec3(0, 0, 0),
			Vec3(0.1, 0.7, 0.7),
			Vec3(0, 0, 0),
			Vec3(0.2, 1.4, 1.4),
			0.2
		)),
		new Sphere(Vec3(-2, -0.3, 7), 3.0, Mat(
			Vec3(1, 1, 1),
			Vec3(0, 0, 0),
			Vec3(0.5, 0.7, 0.2),
			Vec3(0, 0, 0),
			Vec3(0, 0, 0),
			0.2
		)),
		new Sphere(Vec3(-2, 0, 3), 0.7, Mat(	// gold
			Vec3(0.13100, 0.44715, 1.4318),
			Vec3(4.0624, 2.4212, 1.9392),
			Vec3(0, 0, 0),
			Vec3(0, 0, 0),
			Vec3(0, 0, 0),
			0.0
		)),
		new Sphere(Vec3(0, 0, 4), 0.5, Mat(		// corning gorilla glass
			Vec3(1.5198, 1.5119, 1.5078),
			Vec3(0, 0, 0),
			Vec3(0, 0.5, 0.5),
			Vec3(0, 0, 0),
			Vec3(0, 0, 0),
			0.0
		)),
		new Sphere(Vec3(2, 0, 5), 1.6, Mat(
			Vec3(1, 1, 1),
			Vec3(0, 0, 0),
			Vec3(0.2, 0.7, 0.3),
			Vec3(0, 0, 0),
			Vec3(0, 0, 0),
			0.2
		)),
		new Sphere(Vec3(-2.5, 3, 4.5), 0.5, Mat(
			Vec3(1, 1, 1),
			Vec3(0, 0, 0),
			Vec3(1, 1, 1),
			Vec3(0, 0, 0),
			Vec3(20, 20, 20),
			0.2
		))
	);
	let m = scene.addMaterials(
		Mat(
			Vec3(1.7630, 1.7707, 1.7761),
			Vec3(0, 0, 0),
			Vec3(0, 0, 0),
			Vec3(1, 1, 1),
			Vec3(0, 0, 0)
		)
	);
	scene.addTriangles(
		Cube.fromPoints(
			Vec3(-2, 2.5, 4),
			Vec3(-2, 2.5, 3),
			Vec3(-1, 2.5, 3),
			Vec3(-1, 2.5, 4),
			Vec3(-1, 1.5, 4),
			Vec3(-1, 1.5, 3),
			Vec3(-2, 1.5, 3),
			Vec3(-2, 1.5, 4),
			m[0]
		).primitives
	);
}



function makeDiffraction(scene) {
	let mats = scene.addMaterials(
		Mat(
			Vec3(1.0, 1.0, 1.0),
			Vec3(0, 0, 0),
			Vec3(0, 0, 0),
			Vec3(0, 0, 0),
			Vec3(0, 0, 0)),
		Mat(
			Vec3(1.0, 1.0, 1.0),
			Vec3(0, 0, 0),
			Vec3(0, 0, 0),
			Vec3(0, 0, 0),
			Vec3(100, 100, 100)
		),
		Mat(
			Vec3(1.5, 1.9, 2.3),
			Vec3(0, 0, 0),
			Vec3(0, 0, 0),
			Vec3(1, 1, 1),
			Vec3(0, 0, 0)
		),
	);
	scene.addTriangles(
		new Triangle(
			Vec3(-5, -0.6, 1),
			Vec3(-5, -0.6, 11),
			Vec3( 5, -0.6, 1),
			mats[0]
		),
		new Triangle(
			Vec3( 5, -0.6, 1),
			Vec3( 5, -0.6, 11),
			Vec3(-5, -0.6, 11),
			mats[0]
		),
		new Triangle(
			Vec3(4, 1, 5),
			Vec3(4, 3, 6),
			Vec3(4, 1, 7),
			mats[1]
		),
		new Triangle(
			Vec3(1.1, -1, 2),
			Vec3(1.1, -1, 5.95),
			Vec3(1.1, 6, 5.95),
			mats[0]
		),
		new Triangle(
			Vec3(1.1, -1, 10),
			Vec3(1.1, -1, 6.05),
			Vec3(1.1, 6, 6.05),
			mats[0]
		),
		new Triangle(
			Vec3(-2, -1, 1),
			Vec3(-2, -1, 11),
			Vec3(-2,  7, 1),
			mats[0]
		),
	// base
		new Triangle(
			Vec3( 1, -0.5, 6),
			Vec3(-1, -0.5, 7),
			Vec3(-1, -0.5, 5),
			mats[2]
		),
	// s1
		new Triangle(
			Vec3( 1, -0.5, 6),
			Vec3(-1, -0.5, 7),
			Vec3( 1,  1.5, 6),
			mats[2]
		),
		new Triangle(
			Vec3( 1,  1.5, 6),
			Vec3(-1, -0.5, 7),
			Vec3(-1,  1.5, 7),
			mats[2]
		),
	// s2
		new Triangle(
			Vec3( 1, -0.5, 6),
			Vec3(-1, -0.5, 5),
			Vec3( 1,  1.5, 6),
			mats[2]
		),
		new Triangle(
			Vec3( 1,  1.5, 6),
			Vec3(-1, -0.5, 5),
			Vec3(-1,  1.5, 5),
			mats[2]
		),
	// s3
		new Triangle(
			Vec3(-1,  1.5, 7),
			Vec3(-1,  1.5, 5),
			Vec3(-1, -0.5, 7),
			mats[2]
		),
		new Triangle(
			Vec3(-1, -0.5, 5),
			Vec3(-1, -0.5, 7),
			Vec3(-1,  1.5, 5),
			mats[2]
		),
	// top
		new Triangle(
			Vec3( 1, 1.5, 6),
			Vec3(-1, 1.5, 7),
			Vec3(-1, 1.5, 5),
			mats[2]
		)
	);
}



function makeCornell(scene) {
	scene.setSky(RefractiveMat(
		Vec3(1, 1, 1), Vec3(1, 1, 1)
	));
	let mats = scene.addMaterials(
		DiffuseMat(Vec3(1, 1, 1)),
		DiffuseMat(Vec3(1, 0, 0)),
		DiffuseMat(Vec3(0, 1, 0)),
		DiffuseMat(Vec3(0, 0, 1)),
		EmmissiveMat(Vec3(2, 2, 2)),
		RefractiveMat(Vec3(2.4065, 2.4232, 2.4445), Vec3(0.9, 0.9, 0.9), 0),
	);
	scene.addSpheres(
		new Sphere( Vec3(-0.5, 5, 4.5), 0.5, mats[5] ),
		new Sphere( Vec3(-0.5, 5, 3.5), 0.5, mats[5] ),
		new Sphere( Vec3(0.5, 5, 3.5), 0.5, mats[5] ),
		new Sphere( Vec3(0.5, 5, 4.5), 0.5, mats[5] ),
		new Sphere( Vec3(0, 4, 4), 0.7, mats[5] ),
		new Sphere( Vec3(-0.5, 3, 4.5), 0.5, mats[5] ),
		new Sphere( Vec3(-0.5, 3, 3.5), 0.5, mats[5] ),
		new Sphere( Vec3(0.5, 3, 3.5), 0.5, mats[5] ),
		new Sphere( Vec3(0.5, 3, 4.5), 0.5, mats[5] ),
		new Sphere( Vec3(0, 2, 4), 0.7, mats[5] ),
		new Sphere( Vec3(-0.5, 1, 4.5), 0.5, mats[5] ),
		new Sphere( Vec3(-0.5, 1, 3.5), 0.5, mats[5] ),
		new Sphere( Vec3(0.5, 1, 3.5), 0.5, mats[5] ),
		new Sphere( Vec3(0.5, 1, 4.5), 0.5, mats[5] )
	);
	const top = Vec3(0, 3.5, 4);
	const a = Vec3(1.7, 2, 5.7);
	const b = Vec3(1.7, 2, 2.3);
	const c = Vec3(-1.7, 2, 2.3);
	const d = Vec3(-1.7, 2, 5.7);
	const bottom = Vec3(0, -0.5, 4);
	scene.addTriangles(
		Quad.fromCorners(
			Vec3(-3, -1, 7),
			Vec3(-3, 7, 7),
			Vec3(3, 7, 7),
			Vec3(3, -1, 7),
			mats[0]
		).primitives,
		Quad.fromCorners(
			Vec3(-3, 7, 7),
			Vec3(-3, -1, 7),
			Vec3(-3, -1, 1),
			Vec3(-3, 7, 1),
			mats[2]
		).primitives,
		Quad.fromCorners(
			Vec3(3, 7, 7),
			Vec3(3, -1, 7),
			Vec3(3, -1, 1),
			Vec3(3, 7, 1),
			mats[1]
		).primitives,
		Quad.fromCorners(
			Vec3(-3, -1, 7),
			Vec3(-3, -1, 1),
			Vec3(3, -1, 1),
			Vec3(3, -1, 7),
			mats[0]
		).primitives,
		Quad.fromCorners(
			Vec3(-3, 7, 7),
			Vec3(-3, 7, 1),
			Vec3(3, 7, 1),
			Vec3(3, 7, 7),
			mats[4]
		).primitives,

		// new Triangle(top, a, b, mats[5]),
		// new Triangle(top, b, c, mats[5]),
		// new Triangle(top, c, d, mats[5]),
		// new Triangle(top, d, a, mats[5]),
		// new Triangle(bottom, a, b, mats[5]),
		// new Triangle(bottom, b, c, mats[5]),
		// new Triangle(bottom, c, d, mats[5]),
		// new Triangle(bottom, d, a, mats[5]),
	);
}