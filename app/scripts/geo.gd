extends RefCounted
class_name Geo

const EARTH_RADIUS_M := 6371000.0

static func haversine_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
	var p1 := deg_to_rad(lat1)
	var p2 := deg_to_rad(lat2)
	var dp := deg_to_rad(lat2 - lat1)
	var dl := deg_to_rad(lng2 - lng1)
	var a := sin(dp / 2.0) * sin(dp / 2.0) + cos(p1) * cos(p2) * sin(dl / 2.0) * sin(dl / 2.0)
	return 2.0 * EARTH_RADIUS_M * asin(min(1.0, sqrt(a)))

static func centroid(latitudes: PackedFloat64Array, longitudes: PackedFloat64Array) -> Vector2:
	if latitudes.is_empty():
		return Vector2.ZERO
	var lat := 0.0
	var lng := 0.0
	for i in latitudes.size():
		lat += latitudes[i]
		lng += longitudes[i]
	return Vector2(lng / latitudes.size(), lat / latitudes.size())

static func segments_cross(a: Vector2, b: Vector2, c: Vector2, d: Vector2) -> bool:
	var d1 := _cross(c, d, a)
	var d2 := _cross(c, d, b)
	var d3 := _cross(a, b, c)
	var d4 := _cross(a, b, d)
	return ((d1 > 0.0 and d2 < 0.0) or (d1 < 0.0 and d2 > 0.0)) and ((d3 > 0.0 and d4 < 0.0) or (d3 < 0.0 and d4 > 0.0))

static func _cross(p: Vector2, q: Vector2, r: Vector2) -> float:
	return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)

static func ring_self_intersects(points: PackedVector2Array) -> bool:
	var n := points.size()
	if n < 4:
		return false
	var edges := n - 1
	for i in edges:
		for j in range(i + 1, edges):
			if j == i + 1:
				continue
			if i == 0 and j == edges - 1:
				continue
			var a := points[i]
			var b := points[i + 1]
			var c := points[j]
			var d := points[j + 1]
			if segments_cross(a, b, c, d):
				return true
	return false

static func world_pixel(lat: float, lng: float, zoom: int) -> Vector2:
	var n := pow(2.0, zoom)
	var x := (lng + 180.0) / 360.0 * n * 256.0
	var lat_rad := deg_to_rad(clamp(lat, -85.05112878, 85.05112878))
	var s := sin(lat_rad)
	var y := (0.5 - log((1.0 + s) / (1.0 - s)) / (4.0 * PI)) * n * 256.0
	return Vector2(x, y)

static func pixel_to_latlng(pixel: Vector2, zoom: int) -> Vector2:
	var n := pow(2.0, zoom)
	var lng := pixel.x / (n * 256.0) * 360.0 - 180.0
	var merc := PI - 2.0 * PI * pixel.y / (n * 256.0)
	var lat := rad_to_deg(atan(sinh(merc)))
	return Vector2(lng, lat)
