#define EPSILON 0.00001
#define PI 3.1415926538

#ifdef GL_FRAGMENT_PRECISION_HIGH
	precision highp float;
#else
	precision mediump float;
#endif

float r_ = 0.0;
float random(vec3 scale, float seed) {
	r_ += 1.0;
	return fract(sin(dot(gl_FragCoord.xyz + (seed + r_), scale)) * 43758.5453 + (seed + r_));
}
vec3 cosineWeightedDirection(float seed, vec3 normal) {
	float u = random(vec3(12.9898, 78.233, 151.7182), seed);
	float v = random(vec3(63.7264, 10.873, 623.6736), seed);
	float r = sqrt(u);
	float angle = 6.283185307179586 * v;	// compute basis from normal
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
	float u = random(vec3(12.9898, 78.233, 151.7182), seed);
	float v = random(vec3(63.7264, 10.873, 623.6736), seed);
	float z = 1.0 - 2.0 * u;
	float r = sqrt(1.0 - z * z);
	float angle = 6.283185307179586 * v;
	return vec3(r * cos(angle), r * sin(angle), z);
}
vec3 uniformlyRandomVector(float seed) {
	return uniformlyRandomDirection(seed) * sqrt(random(vec3(36.7539, 50.3658, 306.2759), seed));
}

struct Ray {
	vec3 origin;
	vec3 direction;
};
struct Hit {
	bool reverse_intersect;
	float time;
	Ray normal;
	vec2 uv;
};

struct Material {
	float roughness;
	float glossiness;
	float transparency;
	float refraction_index;
};

bool _reflect(in Ray src, in Hit hit, out Ray ret) {
	ret.origin = hit.normal.origin;
	ret.direction = reflect(src.direction, hit.normal.direction);
	return dot(ret.direction, hit.normal.direction) > 0.0;
}
bool _refract(in Ray src, in Hit hit, in float ir, out Ray ret) {
	ret.origin = hit.normal.origin;
	ret.direction = refract(src.direction, hit.normal.direction, ir);
	return true;
}
bool reflectGlossy(in Ray src, in Hit hit, out Ray ret, float gloss) {
	ret.origin = hit.normal.origin;
	ret.direction = reflect(src.direction, hit.normal.direction) + (uniformlyRandomDirection(hit.time) * gloss);
	return dot(ret.direction, hit.normal.direction) > 0.0;
}
float reflectance(float cos, float ir) {
	return pow( ((1. - ir) / (1. + ir)), 2. ) + (1. - ir) * pow(1. - cos, 5.);
}
bool refractGlossy(in Ray src, in Hit hit, in float ir, out Ray ret, float gloss) {
	float cos_theta = min(dot(-src.direction, hit.normal.direction), 1.0);
	float sin_theta = sqrt(1.0 - cos_theta * cos_theta);
	if(!hit.reverse_intersect) {
		ir = 1. / ir;
	}
	float r = random(src.direction * hit.normal.direction, hit.time);
	if ((ir * sin_theta) > 1.0 || (reflectance(cos_theta, ir) > r)) {
		return reflectGlossy(src, hit, ret, gloss);
	}
	vec3 r_out_perp = ir * (src.direction + cos_theta * hit.normal.direction);
	vec3 r_out_para = -sqrt(abs(1.0 - dot(r_out_perp, r_out_perp))) * hit.normal.direction;
	ret.direction = r_out_perp + r_out_para;
	ret.origin = hit.normal.origin;
	return true;
}
bool diffuse(in Hit hit, out Ray ret) {
	ret.origin = hit.normal.origin;
	ret.direction = cosineWeightedDirection(hit.time, hit.normal.direction);
	return true;
}
bool redirectRay(in Ray src, in Hit hit, in Material mat, out Ray ret) {
	float rand = random(vec3(36.7539, 50.3658, 306.2759) * src.direction, hit.time);
	if(rand < mat.roughness) {
		return diffuse(hit, ret);
	} else if(rand < mat.transparency) {
		return refractGlossy(src, hit, mat.refraction_index, ret, mat.glossiness);
	} else {
		return reflectGlossy(src, hit, ret, mat.glossiness);
	}
}


struct Sphere {
	vec3 position;
	float radius;
	float luminance;
	vec3 albedo;
	Material mat;
};

bool interactsSphere(in Ray ray, in Sphere s, inout Hit hit, float t_min, float t_max) {
	vec3 o = ray.origin - s.position;
	float a = dot(ray.direction, ray.direction);
	float b = 2.0 * dot(o, ray.direction);
	float c = dot(o, o) - (s.radius * s.radius);
	float d = (b * b) - (4.0 * a * c);
	if(d < 0.0) {
		return false;
	}
	hit.time = (sqrt(d) + b) / (-2.0 * a);
	if(hit.time < t_min || hit.time > t_max) {
		return false;
	}
	hit.normal.origin = ray.direction * hit.time + ray.origin;
	hit.normal.direction = normalize(hit.normal.origin - s.position);
	hit.reverse_intersect = dot(hit.normal.direction, ray.direction) > 0.0;
	if(hit.reverse_intersect) {
		hit.normal.direction *= -1.0;
	}
	return true;
}

vec3 getSourceRay(in vec2 proportional, in mat4 inv_proj, in mat4 inv_view) {
	vec4 t = inv_proj * vec4( (proportional * 2.0 - 1.0), 1.0, 1.0);
	return vec3( inv_view * vec4( normalize(vec3(t) / t.w), 0) );
}

// const Sphere objs[4] = Sphere[4](
// 	Sphere(vec3(0, 0, 4), 0.5, 0.0, vec3(0, 0.5, 0.5), Material(1.0, 0.0, 1.0, 1.5)),
// 	Sphere(vec3(2, 0, 5), 1.6, 0.0, vec3(0.6, 0.5, 0.2), Material(0.0, 0.0, 0.0, 0.0)),
// 	Sphere(vec3(-2, 2, 3), 0.3, 10.0, vec3(0.7, 0.2, 0.8), Material(1.0, 0.0, 0.0, 0.0)),
// 	Sphere(vec3(0, -100.3, 0), 100.0, 0.0, vec3(0.5, 0.7, 0.9), Material(1.0, 0.0, 0.0, 0.0))
// );
const Sphere objs[5] = Sphere[5](
	Sphere(vec3(0, 0.1, 3), 0.6, 0.0, vec3(0.1, 0.7, 0.7), Material(0.0, 0.0, 1.0, 1.4)),
	Sphere(vec3(0, -10, 4), 9.6, 0.0, vec3(0.7, 0.6, 0.8), Material(1.0, 0.0, 0.0, 0.0)),
	Sphere(vec3(1, 1, 5), 1.0, 7.0, vec3(0.5, 0.2, 0.2), Material(1.0, 0.0, 0.0, 0.0)),
	Sphere(vec3(-2, -0.3, 7), 3.0, 0.0, vec3(0.5, 0.7, 0.2), Material(1.0, 0.0, 0.0, 0.0)),
	Sphere(vec3(-1.8, 0, 3), 0.7, 0.0, vec3(0.7, 0.5, 0.1), Material(0.0, 0.0, 0.0, 0.0))
);
vec3 evalRay(in Ray ray, in int bounces) {
	vec3 total = vec3(0.0);
	vec3 cache = vec3(1.0);
	Ray current = ray;
	for(int b = bounces; b >= 0; b--) {
		Hit hit;
		hit.time = 10000000000000.;
		Hit tmp;
		bool interaction = false;
		int idx = -1;
		for(int i = 0; i < objs.length(); i++) {
			if(interactsSphere(current, objs[i], tmp, 0.0, hit.time)) {
				hit = tmp;
				interaction = true;
				idx = i;
			}
		}
		if(interaction) {
			float lum = objs[idx].luminance;
			vec3 clr = objs[idx].albedo;
			if(b == 0 || ((clr.x + clr.y + clr.z) / 3. * lum) >= 1.) {
				total += cache * clr * lum;
				return total;
			}
			Ray redirect;
			if(redirectRay(current, hit, objs[idx].mat, redirect)) {
				cache *= clr;
				total += cache * lum;
				current = redirect;
				continue;
			}
		}
		total += cache * vec3(0.05);
		break;
	}
	return total;
}

uniform mat4 iview, iproj;
uniform vec3 cam_pos;
uniform vec2 fsize;
uniform float realtime;
uniform float scale;
out vec4 pixColor;
void main() {
	//vec3 ray = getSourceRay(vec2(gl_FragCoord) / vec2(1280.0, 720.0), iproj, iview);
	Ray src = Ray(cam_pos, vec3(0.0));
	vec3 clr;
	for(int i = 0; i < 20; i++) {
		float r = random(clr, float(i));
		src.direction = getSourceRay((vec2(gl_FragCoord) + vec2(r)) / fsize, iproj, iview);
		clr += evalRay(src, 5);
	}
	clr /= 20.0;
	pixColor = vec4(sqrt(clr), 1.0);
	// Hit h;
	// if(interactsSphere(src, sp, h, 0.0, 1000000.0)) {
	// 	gl_FragColor = vec4(h.normal.direction * 0.5 + 0.5, 1);
	// } else {
	// 	gl_FragColor = vec4(0, 0, 0, 1);
	// }
	//ray = ray / 2.0 + 0.5;
	//gl_FragColor = vec4(ray.x, ray.y, ray.z, 1);
}