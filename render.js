//Promise.resolve(getShaderSource("fragment.glsl")).then((src) => {main(src);});
async function getShaderSource(fname) {
	return await fetch(fname).then(result => result.text());
}
function compileShader(gl, source, type) {
	let shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.log(gl.getShaderInfoLog(shader));
		alert(`Failed to compile shader (type: ${type}) - see console for details.`);
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}
function linkProgram(gl, vshader, fshader) {
	let program = gl.createProgram();
	gl.attachShader(program, vshader);
	gl.attachShader(program, fshader);
	gl.linkProgram(program);
	if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.log(gl.getProgramInfoLog(program));
		alert("Failed to link program - see console for details.");
		gl.deleteProgram(program);
		return null;
	}
	return program;
}
function buildProgram(gl, vsource, fsource) {		// faster than calling all methods in separate
	let start = performance.now();
	let vshader = gl.createShader(gl.VERTEX_SHADER);
	let fshader = gl.createShader(gl.FRAGMENT_SHADER);
	let program = gl.createProgram();
	gl.shaderSource(vshader, vsource);
	gl.shaderSource(fshader, fsource);
	gl.attachShader(program, vshader);
	gl.attachShader(program, fshader);

	gl.compileShader(vshader);
	gl.compileShader(fshader);
	gl.linkProgram(program);

	if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		let end = performance.now();
		console.error(`WebGL shader program link failed in ${end - start}ms: ${gl.getProgramInfoLog(program)}`);
		if(!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
			console.log(`Vertex shader log:\n${gl.getShaderInfoLog(vshader)}`);
		}
		if(!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
			console.log(`Fragment shader log:\n${gl.getShaderInfoLog(fshader)}`);
		}
		alert("Failed to compile WebGL shader program - see console for logs.");
		return null;
	}
	let end = performance.now();
	console.log("Built shader program in " + (end - start) + "ms");
	return program;
}

function genTextureRGBA32F(gl, w, h) {
	let t = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, t);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, w, h, 0, gl.RGBA, gl.FLOAT, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return t;
}

function listActiveUniforms(gl, program) {
	const num = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
	for(let i = 0; i < num; i++) {
		console.log(gl.getActiveUniform(program, i).name);
	}
}

function bindTextureUnit(gl, program, unit, uniform) {
	gl.uniform1i(
		gl.getUniformLocation(program, uniform),
		unit
	);
}



const fb_vertex_src = `#version 300 es
layout(location = 0) in vec2 vertex;
out vec2 fragCoord;

void main() {
	fragCoord = vertex * 0.5 + 0.5;
	gl_Position = vec4(vertex, 0.0, 1.0);
}
`;
const fb_fragment_src = `#version 300 es
#ifdef GL_FRAGMENT_PRECISION_HIGH
	precision highp float;
#else
	precision mediump float;
#endif

in vec2 fragCoord;
uniform sampler2D framebuff;
uniform float total_samples;

out vec4 fragColor;
void main() {
	fragColor = vec4(sqrt(texture(framebuff, fragCoord).rgb / total_samples), 1.0);
	// fragColor = vec4(texture(framebuff, fragCoord).rgb / total_samples, 1.0);
}
`;

const vertex_src = `#version 300 es
layout(location = 0) in vec2 vertex;

void main() {
	gl_Position = vec4(vertex, 0.0, 1.0);
}
`;
const fragment_src = `#version 300 es
#ifdef GL_FRAGMENT_PRECISION_HIGH
	precision highp float;
#else
	precision mediump float;
#endif


#define EPSILON 0.00001		// 1e-5
#define PI 3.14159265358979
#define PI2 6.283185307179586
#define PHI 1.61803398874989484820459

uniform sampler2D acc_frame;
uniform mat4 iview, iproj;
uniform vec3 cam_pos;
uniform vec3 cam_vdir;
uniform vec3 cam_rdir;
uniform vec2 fsize;
uniform float focus_distance;
uniform float aperture;
uniform float realtime;
uniform int samples;
uniform int bounces;
uniform int simple;


#define SPHERE_FLOATS 5
#define TRIANGLE_FLOATS 10
#define MATERIAL_FLOATS 16

#define MAX_RECURSIVE_MATERIALS 32
#define SKYBOX_MATERIAL_ID 0

struct Sphere {
	vec3 center;
	float radius;
	int _mat;
};
struct Triangle {
	vec3 a, b, c;
	int _mat;
};

struct Material {
	float specular_n[3];		// refraction index n for each wavelength RGB
	float specular_k[3];		// refraction index k for each wavelength RGB --> most materials will set this to all 0's
	float diffusive[3];			// lambertian diffusion of each wavelength RGB
	float transmissive[3];		// transmission of each wavelength RGB		// all energy (light) that isn't reflected as per fresnel is either diffused or transmitted (physically these are the same thing) --> diffusive and transmissive should in theory add to a maximum of 1 (per wavelength)
	float emmissive[3];			// emmission for each wavelength RGB
	float specular_roughness;	// glossiness - a measure of micro-geometry
};

uniform sampler2D sphere_data;
uniform sampler2D triangle_data;
uniform sampler2D material_data;
// something to indicate selected objects

float sample1d(in sampler2D smp, in int beg) {
	return texelFetch(smp, ivec2(beg, 0), 0).x;
}
vec3 sample1d_v3(in sampler2D smp, in int beg) {
	return vec3(
		texelFetch(smp, ivec2(beg, 0), 0).x,
		texelFetch(smp, ivec2(beg + 1, 0), 0).x,
		texelFetch(smp, ivec2(beg + 2, 0), 0).x
	);
}
void sphere_at(in int num, out Sphere s) {
	s.center = vec3(
		texelFetch(sphere_data, ivec2(0, num), 0).x,
		texelFetch(sphere_data, ivec2(1, num), 0).x,
		texelFetch(sphere_data, ivec2(2, num), 0).x);
	s.radius =
		texelFetch(sphere_data, ivec2(3, num), 0).x;
	s._mat = int(
		texelFetch(sphere_data, ivec2(4, num), 0).x);
}
void triangle_at(in int num, out Triangle t) {
	t.a = vec3(
		texelFetch(triangle_data, ivec2(0, num), 0).x,
		texelFetch(triangle_data, ivec2(1, num), 0).x,
		texelFetch(triangle_data, ivec2(2, num), 0).x);
	t.b = vec3(
		texelFetch(triangle_data, ivec2(3, num), 0).x,
		texelFetch(triangle_data, ivec2(4, num), 0).x,
		texelFetch(triangle_data, ivec2(5, num), 0).x);
	t.c = vec3(
		texelFetch(triangle_data, ivec2(6, num), 0).x,
		texelFetch(triangle_data, ivec2(7, num), 0).x,
		texelFetch(triangle_data, ivec2(8, num), 0).x);
	t._mat = int(
		texelFetch(triangle_data, ivec2(9, num), 0).x);
}
void material_at(in int num, out Material m) {
	m.specular_n[0] =
		texelFetch(material_data, ivec2(0, num), 0).x;
	m.specular_n[1] =
		texelFetch(material_data, ivec2(1, num), 0).x;
	m.specular_n[2] =
		texelFetch(material_data, ivec2(2, num), 0).x;
	m.specular_k[0] =
		texelFetch(material_data, ivec2(3, num), 0).x;
	m.specular_k[1] =
		texelFetch(material_data, ivec2(4, num), 0).x;
	m.specular_k[2] =
		texelFetch(material_data, ivec2(5, num), 0).x;
	m.diffusive[0] =
		texelFetch(material_data, ivec2(6, num), 0).x;
	m.diffusive[1] =
		texelFetch(material_data, ivec2(7, num), 0).x;
	m.diffusive[2] =
		texelFetch(material_data, ivec2(8, num), 0).x;
	m.transmissive[0] =
		texelFetch(material_data, ivec2(9, num), 0).x;
	m.transmissive[1] =
		texelFetch(material_data, ivec2(10, num), 0).x;
	m.transmissive[2] =
		texelFetch(material_data, ivec2(11, num), 0).x;
	m.emmissive[0] =
		texelFetch(material_data, ivec2(12, num), 0).x;
	m.emmissive[1] =
		texelFetch(material_data, ivec2(13, num), 0).x;
	m.emmissive[2] =
		texelFetch(material_data, ivec2(14, num), 0).x;
	m.specular_roughness =
		texelFetch(material_data, ivec2(15, num), 0).x;
}

int sphere_count() {
	return int(textureSize(sphere_data, 0).y);
}
int triangle_count() {
	return int(textureSize(triangle_data, 0).y);
}
int material_count() {
	return int(textureSize(material_data, 0).y);
}





/* RANDOM */

const vec3 _rc1_ = vec3(12.9898, 78.233, 151.7182);
const vec3 _rc2_ = vec3(63.7264, 10.873, 623.6736);
const vec3 _rc3_ = vec3(36.7539, 50.3658, 306.2759);
float _rseed_ = (PI / PHI);
float rseed() {
	_rseed_ += (fract(sqrt(realtime)));
	return _rseed_;
}

float s_random_gen(in vec3 scale, in float seed) {
	highp float d = 43758.5453;
	highp float dt = dot(gl_FragCoord.xyz + seed, scale);
	highp float sn = mod(dt, PI);
	return fract(sin(sn) * d);
}
float random_gen(in vec3 scale) {
	return s_random_gen(scale, rseed());
}
float srand(in float seed) { return s_random_gen(gl_FragCoord.xyz * realtime, seed); }
float rand() { return random_gen(gl_FragCoord.xyz * realtime); }

vec2 randVec2() {
	return (vec2(
		random_gen(_rc1_),
		random_gen(_rc2_)
	) * 2.0 - 1.0);
}
vec2 srandVec2(in float seed) {
	return (vec2(
		s_random_gen(_rc1_, seed),
		s_random_gen(_rc2_, seed)
	) * 2.0 - 1.0);
}
vec3 randVec3() {
	return (vec3(
		random_gen(_rc1_),
		random_gen(_rc2_),
		random_gen(_rc3_)
	) * 2.0 - 1.0);
}
vec3 srandVec3(in float seed) {
	return (vec3(
		s_random_gen(_rc1_, seed),
		s_random_gen(_rc2_, seed),
		s_random_gen(_rc3_, seed)
	) * 2.0 - 1.0);
}
vec3 randomUnitVector() { return normalize(randVec3()); }
vec3 seededRandomUnitVector(in float seed) { return normalize(srandVec3(seed)); }

vec3 cosineWeightedDirection(float seed, vec3 normal) {
	float u = s_random_gen(_rc1_, seed);
	float v = s_random_gen(_rc2_, seed);
	float r = sqrt(u);
	float angle = PI2 * v;	// compute basis from normal
	vec3 sdir, tdir;
	if (abs(normal.x) < .5) {
		sdir = cross(normal, vec3(1,0,0));
	} else {
		sdir = cross(normal, vec3(0,1,0));
	}
	tdir = cross(normal, sdir);
	return r * cos(angle) * sdir + r * sin(angle) * tdir + sqrt(1. - u) * normal;
}
vec3 uniformlyRandomDirection(float seed) {
	float u = s_random_gen(_rc1_, seed);
	float v = s_random_gen(_rc2_, seed);
	float z = 1.0 - 2.0 * u;
	float r = sqrt(1.0 - z * z);
	float angle = PI2 * v;
	return vec3(r * cos(angle), r * sin(angle), z);
}
vec3 uniformlyRandomVector(float seed) {
	return uniformlyRandomDirection(seed) * sqrt(s_random_gen(_rc3_, seed));
}
vec2 randomUnitVec2_Reject(float seed) {
	while(true) {
		vec2 test = srandVec2(seed);
		if(dot(test, test) <= 1.0) {
			return test;
		}
		seed += 1.0;
	}
}
vec3 randomUnitVec3_Reject(float seed) {
	while(true) {
		vec3 test = srandVec3(seed);
		if(dot(test, test) <= 1.0) {
			return test;
		}
		seed += 1.0;
	}
}




/* GEOMETRY and INTERACTIONS */

struct Ray {
	vec3 origin;
	vec3 direction;
};
struct Hit {
	bool internal;
	float time;
	Ray normal;
	//vec2 uv;
};

bool _reflect(in Ray src, in Hit hit, out Ray ret) {
	ret.origin = hit.normal.origin;
	ret.direction = reflect(src.direction, hit.normal.direction);
	return dot(ret.direction, hit.normal.direction) > 0.0;
}
bool _refract(in Ray src, in Hit hit, out Ray ret, in float eta) {
	ret.origin = hit.normal.origin;
	ret.direction = refract(src.direction, hit.normal.direction, eta);
	return true;
}

float reflectance_approx(float cos, float r0) {	// Schlick approx
	return r0 + (1.0 - r0) * pow(1.0 - cos, 5.0);
}
float reflectance_exact(float cosi, float cost, float n1, float n2) {	// Fresnel w/o complex refractive indices
	float r1 = (n1*cosi - n2*cost) / (n1*cosi + n2*cost);
	float r2 = (n1*cost - n2*cosi) / (n1*cost + n2*cosi);
	return (r1*r1 + r2*r2) / 2.0;
}
float reflectance_complex(float cosi, float sini, float eta, float k) {	// Fresnel w/ complex refractive indices
	float cosi2 = cosi * cosi;
	float sini2 = sini * sini;
	float sini4 = sini2 * sini2;
	float eta2 = eta * eta;
	float k2 = k * k;
	float x = eta2 - k2 - sini2;
	float c = sqrt(x*x + 4.0*eta2*k2);
	float a = 2.0*sqrt(0.5*(c + x));	// a is not actually multplied by 2, but is in all the places where it is used
	float r1 = (c - a*cosi + cosi2) / (c + a*cosi + cosi2);
	float r2 = (cosi2*c - a*cosi*sini2 + sini4) / (cosi2*c + a*cosi*sini2 + sini4) * r1;
	return (r1 + r2) / 2.0;
}

float ir_eta(float n1, float k1, float n2, float k2) {
	if(k1 == 0.0 && k2 == 0.0) { return n2 / n1; }
	return (n2*n1 + k2*k1) / (n1*n1 + k1*k1);
}
float ir_eta_k(float n1, float k1, float n2, float k2) {
	if(k1 == 0.0 && k2 == 0.0) { return 0.0; }
	return (k2*n1 - n2*k1) / (n1*n1 + k1*k1);
}
vec2 ir_eta_complex(float n1, float k1, float n2, float k2) {
	if(k1 == 0.0 && k2 == 0.0) { return vec2(n2 / n1, 0); }
	float d = (n1*n1 + k1*k1);
	return vec2(
		(n2*n1 + k2*k1) / d,
		(k2*n1 - n2*k1) / d );
}
float simple_r0(float n1, float n2) {
	float r = (n1 - n2) / (n1 + n2);
	return r*r;
}
float complex_r0(float eta, float k) {
	float k2 = k*k;
	float a = eta - 1.0;
	float b = eta + 1.0;
	return (a*a + k2) / (b*b + k2);
}

// vec3 computeReflectance3(in Material from, in Material to, in Ray src, in Hit hit) {
// 	float cosi = min(dot(-src.direction, hit.normal.direction), 1.0);
// 	float sini = sqrt(1.0 - cosi*cosi);
// 	vec3 ret;
// 	vec2 eta_cx;
// 	if((from.specular_n[0] == from.specular_n[1] == from.specular_n[2]) &&
// 		(from.specular_k[0] == from.specular_k[1] == from.specular_k[2]) &&
// 		(to.specular_n[0] == to.specular_n[1] == to.specular_n[2]) &&
// 		(to.specular_k[0] == to.specular_k[1] == to.specular_k[2])
// 	) {
// 		eta_cx = ir_eta_complex(from.specular_n[0], from.specular_k[0], to.specular_n[1], to.specular_k[1]);
// 		ret.x = ret.y = ret.z = reflectance_complex(cosi, sini, eta_cx.x, eta_cx.y);
// 	} else {
// 		eta_cx = ir_eta_complex(from.specular_n[0], from.specular_k[0], to.specular_n[0], to.specular_k[0]);
// 		ret.x = reflectance_complex(cosi, sini, eta_cx.x, eta_cx.y);
// 		eta_cx = ir_eta_complex(from.specular_n[1], from.specular_k[1], to.specular_n[1], to.specular_k[1]);
// 		ret.y = reflectance_complex(cosi, sini, eta_cx.x, eta_cx.y);
// 		eta_cx = ir_eta_complex(from.specular_n[2], from.specular_k[2], to.specular_n[2], to.specular_k[2]);
// 		ret.z = reflectance_complex(cosi, sini, eta_cx.x, eta_cx.y);
// 	}
// 	return ret;
// }

// bool reflectGlossy(in Ray src, in Hit hit, out Ray ret, float gloss) {
// 	ret.origin = hit.normal.origin;
// 	ret.direction = reflect(src.direction, hit.normal.direction) + (randomUnitVec3_Reject(rseed()) * gloss);
// 	return dot(ret.direction, hit.normal.direction) > 0.0;
// }
// bool refractGlossy(in Ray src, in Hit hit, out Ray ret, in float ir, in float gloss) {
// 	if(!hit.reverse_intersect) { ir = 1.0 / ir; }
// 	float cos_theta = min(dot(-src.direction, hit.normal.direction), 1.0);
// 	float sin_theta = sqrt(1.0 - cos_theta * cos_theta);
// 	float r = rand();
// 	if ((ir * sin_theta) > 1.0 || (reflectance_approx(cos_theta, ir) > r)) {
// 		return reflectGlossy(src, hit, ret, gloss);
// 	}
// 	vec3 r_out_perp = ir * (src.direction + cos_theta * hit.normal.direction);
// 	vec3 r_out_para = -sqrt(abs(1.0 - dot(r_out_perp, r_out_perp))) * hit.normal.direction;
// 	ret.direction = r_out_perp + r_out_para + (randomUnitVec3_Reject(rseed()) * gloss);
// 	ret.origin = hit.normal.origin;
// 	return true;
// }
// bool diffuse(in Hit hit, out Ray ret) {
// 	ret.origin = hit.normal.origin;
// 	//ret.direction = cosineWeightedDirection(rseed(), hit.normal.direction);
// 	//ret.direction = hit.normal.direction + uniformlyRandomVector(rseed());
// 	ret.direction = hit.normal.direction + randomUnitVec3_Reject(rseed());		// ha, my method is better
// 	return true;
// }
// bool redirectRay(in Ray src, in Hit hit, in Material mat, out Ray ret) {
// 	float r = rand();
// 	if(r < mat.roughness) {
// 		return diffuse(hit, ret);
// 	} else if(r < mat.transparency) {
// 		return refractGlossy(src, hit, ret, mat.refraction_index, mat.glossiness);
// 		//return _refract(src, hit, ret, mat.refraction_index);
// 	} else {
// 		return reflectGlossy(src, hit, ret, mat.glossiness);
// 	}
// }



bool interactsSphere(in Ray ray, in Sphere s, inout Hit hit, float t_min, float t_max) {
	vec3 o = ray.origin - s.center;
	float a = dot(ray.direction, ray.direction);
	float b = 2.0 * dot(o, ray.direction);
	float c = dot(o, o) - (s.radius * s.radius);
	float d = (b * b) - (4.0 * a * c);
	if(d < 0.0) {
		return false;
	}
	hit.time = (sqrt(d) + b) / (-2.0 * a);
	if(hit.time < t_min || hit.time > t_max) {
		hit.time  = (-sqrt(d) + b) / (-2.0 * a);
		if(hit.time < t_min || hit.time > t_max) {
			return false;
		}
	}
	hit.normal.origin = ray.direction * hit.time + ray.origin;
	hit.normal.direction = normalize(hit.normal.origin - s.center);
	hit.internal = dot(hit.normal.direction, ray.direction) > 0.0;
	hit.normal.origin = s.center + hit.normal.direction * s.radius;
	if(hit.internal) {
		hit.normal.direction *= -1.0;
	}
	//hit.normal.origin += hit.normal.direction * EPSILON;	// no accidental re-collision
	return true;
}
bool interactsTriangle(in Ray ray, in Triangle t, inout Hit hit, float t_min, float t_max) {
	vec3 h, s, q;
	vec3 s1 = t.b - t.a, s2 = t.c - t.a;
	float a, f, u, v;

	h = cross(ray.direction, s2);
	a = dot(s1, h);
	if(a > -EPSILON && a < EPSILON) { return false; }
	f = 1.0 / a;
	s = ray.origin - t.a;
	u = f * dot(s, h);
	if(u < 0.0 || u > 1.0) { return false; }
	q = cross(s, s1);
	v = f * dot(ray.direction, q);
	if(v < 0.0 || u + v > 1.0) { return false; }

	hit.time = f * dot(s2, q);
	if(hit.time <= EPSILON || hit.time < t_min || hit.time > t_max) { return false; }
	hit.normal.origin = ray.origin + ray.direction * hit.time;
	hit.normal.direction = normalize(cross(s1, s2));
	hit.internal = false;
	if(dot(hit.normal.direction, ray.direction) > 0.0) {
		hit.normal.direction *= -1.0;
	}
	return true;
}

int interactsScene(in Ray src, inout Hit hit) {
	int ret = -1;
	Hit tmp;
	Sphere s;
	Triangle t;
	for(int i = 0; i < sphere_count(); i++) {
		sphere_at(i, s);
		if(interactsSphere(src, s, tmp, EPSILON, hit.time)) {
			hit = tmp;
			ret = s._mat;
		}
	}
	for(int i = 0; i < triangle_count(); i++) {
		triangle_at(i, t);
		if(interactsTriangle(src, t, tmp, EPSILON, hit.time)) {
			hit = tmp;
			ret = t._mat;
		}
	}
	// add more here for each obj type...
	return ret;
}




/* RAY EVALUATION */

vec3 getSourceRay(in vec2 proportional, in mat4 inv_proj, in mat4 inv_view) {
	vec4 t = inv_proj * vec4( (proportional * 2.0 - 1.0), 1.0, 1.0);
	return vec3( inv_view * vec4( normalize(vec3(t) / t.w), 0) );
}
void DOFRay(inout Ray ray, vec3 vdir, vec3 rdir, float aperature, float focus_dist) {
	vec3 p = ray.direction * focus_dist;
	vec2 r = randomUnitVec2_Reject(rseed());
	vec3 o = ((vdir * r.x + rdir * r.y) * aperature / 2.0);
	// vec3 o = ((vdir * srand(rseed()) + rdir * srand(rseed())) * aperature / 2.0);	// square bokeh
	ray.direction = normalize(p - o);
	ray.origin += o;
}

vec3 evalRaySimple(in Ray ray) {
	Hit hit;
	hit.time = 1e10;
	int id = interactsScene(ray, hit);
	if(id < 0) { id = SKYBOX_MATERIAL_ID; }
	Material mat;
	material_at(id, mat);
	return vec3(mat.diffusive[0], mat.diffusive[1], mat.diffusive[2]);
}
float traceSpectral(in int i, in Ray src, in int bounces) {
	float total = 0.0;
	// float cache = 1.0;
	int material_path[MAX_RECURSIVE_MATERIALS];
	int mat_chain_len = 0;
	material_path[0] = SKYBOX_MATERIAL_ID;	// or eqivelant skybox material id
	Ray ray = src;
	Hit hit;
	Material mat_i, mat_t;
	for(int b = bounces; b >= 0; b--) {
		hit.time = 1e10;
		int id = interactsScene(ray, hit);
		if(id != -1) {
			if(id == material_path[mat_chain_len]) {
				mat_chain_len--;
				material_at(id, mat_i);
				material_at(material_path[mat_chain_len], mat_t);
			} else {
				material_at(material_path[mat_chain_len], mat_i);
				material_at(id, mat_t);
				mat_chain_len++;	// check against max size
				material_path[mat_chain_len] = id;
			}
			if(b == 0 || mat_t.emmissive[i] >= 1.0) {
				return total + mat_t.emmissive[i];	// emmissive * cache , but this is currently always 1
			}
			float cosi = min(dot(-ray.direction, hit.normal.direction), 1.0);
			float sini = sqrt(1.0 - cosi*cosi);
			vec2 eta_cx = ir_eta_complex(
				mat_i.specular_n[i], mat_i.specular_k[i],
				mat_t.specular_n[i], mat_t.specular_k[i]);
			// test if r0 or not complex --> use optimized computations
			float refl = reflectance_complex(cosi, sini, eta_cx.x, eta_cx.y);
			float r = rand();
			if(r <= refl) {	// specular reflection
				ray.origin = hit.normal.origin;
				ray.direction = reflect(ray.direction, hit.normal.direction) + (randomUnitVec3_Reject(rseed()) * mat_t.specular_roughness);
			} else {	// transmission --> can be diffused or transmitted (transparently), or [insert subsurface scattering here]
				if(r <= mat_t.diffusive[i]) {
					ray.origin = hit.normal.origin;
					ray.direction = hit.normal.direction + randomUnitVec3_Reject(rseed());
				} else if(mat_t.transmissive[i] > 0.0) {
					ray.origin = hit.normal.origin;
					ray.direction = refract(ray.direction, hit.normal.direction, eta_cx.x) + (randomUnitVec3_Reject(rseed()) * mat_t.specular_roughness);;		// figure out complex ir transmission angle?
				} else {
					return 0.0;	// absorption has occurred
				}
			}
			total += mat_t.emmissive[i];	// see earlier comment about multiplying by cache if ever not 1
			continue;
			// could exit if total > 1.0, but this might mess up the temporal convergence
		}
		material_at(material_path[0], mat_t);
		total += mat_t.emmissive[i];	// see earlier comment about multiplying by cache if ever not 1
	}
	return total;
}
vec3 evalRay(in Ray ray, in int bounces) {
	vec3 ret;
	ret.x = traceSpectral(0, ray, bounces);
	ret.y = traceSpectral(1, ray, bounces);
	ret.z = traceSpectral(2, ray, bounces);
	return ret;
}

out vec4 fragColor;
void main() {
	Ray base = Ray(cam_pos, vec3(0.0));
	vec3 clr = texelFetch(acc_frame, ivec2(gl_FragCoord.xy), 0).rgb;
	if(simple > 0) {
		for(int i = 0; i < samples; i++) {
			float r = rand();
			base.direction = getSourceRay((gl_FragCoord.xy + vec2(r)) / fsize, iproj, iview);
			clr += evalRaySimple(base);
		}
	} else {
		Ray dof;
		for(int i = 0; i < samples; i++) {
			float r = rand();
			base.direction = getSourceRay((vec2(gl_FragCoord) + vec2(r)) / fsize, iproj, iview);
			dof.origin = base.origin;
			dof.direction = base.direction;
			DOFRay(dof, cam_vdir, cam_rdir, aperture, focus_distance);
			clr += evalRay(dof, bounces);
		}
	}
	fragColor = vec4(clr, 1.0);
}
`;