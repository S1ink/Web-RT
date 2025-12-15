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
            Vec3(1, 1, 1),
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



function makeDiffraction2(scene)
{
    let mats = scene.addMaterials(
        DiffuseMat(
            Vec3(0.5, 0.5, 0.5)),        // floor
        DiffuseMat(
            Vec3(0.95, 0.95, 0.95)),     // walls / screen
        DiffuseMat(
            Vec3(0.2, 0.2, 0.2)),        // slits
        EmmissiveMat(Vec3(100, 100, 100)),                 // light
        RefractiveMat(
            Vec3(1.4654, 1.51674556, 1.609166),
            Vec3(1, 1, 1))          // glass
    );
    scene.addTriangles(
        Cube.fromBounds(
            Vec3(-5, -0.05, -5),
            Vec3(5, 0, 5),
            mats[1] // floor
        ).primitives,
        Cube.fromBounds(
            Vec3(-2.05, 0, -0.1),
            Vec3(-2, 0.2, 0.1),
            mats[3] // emmissive
        ).primitives,
        Cube.fromBounds(
            Vec3(-1, 0, 0.01),
            Vec3(-0.99, 0.8, 0.76),
            mats[2] // slit
        ).primitives,
        Cube.fromBounds(
            Vec3(-1, 0, -0.76),
            Vec3(-0.99, 0.8, -0.01),
            mats[2] // slit
        ).primitives/*,
        Cube.fromBounds(
            Vec3(0.5, 0, -1.25),
            Vec3(0.55, 2, 1.25),
            mats[1] // screen
        ).primitives*/);

    const TOP = new Triangle(
        Vec3(-0.20710678 - 0.6, 1.2, -0.2),
        Vec3(0.2, 1.2, 0.4),
        Vec3(0.2, 1.2, -0.8),
        mats[4]);
    const BOT = new Triangle(
        Vec3(-0.20710678 - 0.6, 0, -0.2),
        Vec3(0.2, 0, -0.8),
        Vec3(0.2, 0, 0.4),
        mats[4]);
    scene.addTriangles(
        TOP,
        BOT,
        Quad.fromCorners(
            BOT.a,
            BOT.c,
            TOP.b,
            TOP.a,
            mats[4]
        ).primitives,
        Quad.fromCorners(
            BOT.c,
            BOT.b,
            TOP.c,
            TOP.b,
            mats[4]
        ).primitives,
        Quad.fromCorners(
            BOT.b,
            BOT.a,
            TOP.a,
            TOP.c,
            mats[4]
        ).primitives
    )
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



function toRad(x) {
    return x / 180 * Math.PI;
}
function makeCrystal(scene) {
    const l1 = [];
    const l2 = [];
    const r = 2;
    const p1 = 0;
    const p2 = toRad(30);
    const p3 = toRad(55);

    for(let i = 0; i < 12; i++) {
        l1.push(toRad(i * 30));
        l2.push(toRad(i * 30 + 15));
    }

    let pts = {
        r1 : [],
        r2 : [],
        r3 : [],
        r4 : [],
        r5 : [],
        top : Vec3(0, 2, 4 + r),
        bottom : Vec3(0, 2, 4 - r)
    };
    for(let i = 0; i < 12; i++) {
        const l = l1[i];
        const _l = l2[i];
        pts.r3.push(Vec3(r * Math.sin(l), 2 + r * Math.cos(l), 4));
        pts.r1.push(Vec3(r * Math.cos(p3) * Math.sin(l), 2 + r * Math.cos(p3) * Math.cos(l), 4 + r * Math.sin(p3)));
        pts.r5.push(Vec3(r * Math.cos(p3) * Math.sin(l), 2 + r * Math.cos(p3) * Math.cos(l), 4 - r * Math.sin(p3)));
        pts.r2.push(Vec3(r * Math.cos(p2) * Math.sin(_l), 2 + r * Math.cos(p2) * Math.cos(_l), 4 + r * Math.sin(p2)));
        pts.r4.push(Vec3(r * Math.cos(p2) * Math.sin(_l), 2 + r * Math.cos(p2) * Math.cos(_l), 4 - r * Math.sin(p2)));
    }
    // console.log(pts);

    const triangles = [];
    const mat = RefractiveMat(Vec3(1.5065, 1.5232, 1.5445), Vec3(0.9, 0.9, 0.9), 0);
    const mats = scene.addMaterials(
        DiffuseMat(Vec3(1, 1, 1)),
        DiffuseMat(Vec3(1, 0, 0)),
        DiffuseMat(Vec3(0, 1, 0)),
        DiffuseMat(Vec3(0, 0, 1)),
        EmmissiveMat(Vec3(2, 2, 2))
    );
    for(let i = 0; i < 11; i++) {
        triangles.push(new Triangle( pts.r3[i], pts.r3[i + 1], pts.r2[i], mat ));
        triangles.push(new Triangle( pts.r2[i], pts.r2[i + 1], pts.r3[i+1], mat ));
        triangles.push(new Triangle( pts.r3[i], pts.r3[i + 1], pts.r4[i], mat ));
        triangles.push(new Triangle( pts.r4[i], pts.r4[i + 1], pts.r3[i+1], mat ));
        triangles.push(new Triangle( pts.r2[i], pts.r2[i + 1], pts.r1[i+1], mat ));
        triangles.push(new Triangle( pts.r1[i], pts.r1[i + 1], pts.r2[i], mat ));
        triangles.push(new Triangle( pts.r4[i], pts.r4[i + 1], pts.r5[i+1], mat ));
        triangles.push(new Triangle( pts.r5[i], pts.r5[i + 1], pts.r4[i], mat ));
        triangles.push(new Triangle(
            pts.r1[i], pts.r1[i + 1], pts.top, mat
        ));
        triangles.push(new Triangle(
            pts.r5[i], pts.r5[i + 1], pts.bottom, mat
        ));
    }
    triangles.push(new Triangle( pts.r3[11], pts.r3[0], pts.r2[11], mat ));
    triangles.push(new Triangle( pts.r2[11], pts.r2[0], pts.r3[0], mat ));
    triangles.push(new Triangle( pts.r3[11], pts.r3[0], pts.r4[11], mat ));
    triangles.push(new Triangle( pts.r4[11], pts.r4[0], pts.r3[0], mat ));
    triangles.push(new Triangle( pts.r2[11], pts.r2[0], pts.r1[0], mat ));
    triangles.push(new Triangle( pts.r1[11], pts.r1[0], pts.r2[11], mat ));
    triangles.push(new Triangle( pts.r4[11], pts.r4[0], pts.r5[0], mat ));
    triangles.push(new Triangle( pts.r5[11], pts.r5[0], pts.r4[11], mat ));
    triangles.push(new Triangle(
        pts.r1[11], pts.r1[0], pts.top, mat
    ));
    triangles.push(new Triangle(
        pts.r5[11], pts.r5[0], pts.bottom, mat
    ));

    scene.setSky(RefractiveMat(
        Vec3(1, 1, 1), Vec3(1, 1, 1)
    ));
    scene.addTriangles(triangles);
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
        ).primitives
    );
}