extends RefCounted
class_name Boundary

const MAX_ACCURACY_M := 10.0
const MIN_STEP_M := 4.0
const CLOSE_M := 3.0
const MIN_PATH_M := 8.0

var latitudes := PackedFloat64Array()
var longitudes := PackedFloat64Array()
var accuracies := PackedFloat64Array()
var closed := false

func count() -> int:
	return latitudes.size()

func clear() -> void:
	latitudes = PackedFloat64Array()
	longitudes = PackedFloat64Array()
	accuracies = PackedFloat64Array()
	closed = false

func try_add(lat: float, lng: float, accuracy: float) -> String:
	if closed:
		return "closed"
	if accuracy < 0.0 or accuracy > MAX_ACCURACY_M:
		return "coarse"
	if count() > 0 and Geo.haversine_m(lat, lng, latitudes[count() - 1], longitudes[count() - 1]) < MIN_STEP_M:
		return "short"
	latitudes.append(lat)
	longitudes.append(lng)
	accuracies.append(accuracy)
	return "added"

func near_start(lat: float, lng: float) -> bool:
	if closed or count() < 3 or path_length() < MIN_PATH_M:
		return false
	return Geo.haversine_m(lat, lng, latitudes[0], longitudes[0]) <= CLOSE_M

func close() -> bool:
	if closed or count() < 3:
		return false
	closed = true
	return true

func path_length() -> float:
	var total := 0.0
	for i in range(1, count()):
		total += Geo.haversine_m(latitudes[i - 1], longitudes[i - 1], latitudes[i], longitudes[i])
	return total

func move_vertex(index: int, lat: float, lng: float) -> void:
	if index < 0 or index >= count():
		return
	latitudes[index] = lat
	longitudes[index] = lng

func insert_after(index: int, lat: float, lng: float) -> int:
	if count() == 0:
		latitudes.append(lat)
		longitudes.append(lng)
		accuracies.append(0.0)
		return 0
	var at := clampi(index + 1, 0, count())
	latitudes.insert(at, lat)
	longitudes.insert(at, lng)
	accuracies.insert(at, 0.0)
	return at

func remove_vertex(index: int) -> void:
	if index < 0 or index >= count():
		return
	latitudes.remove_at(index)
	longitudes.remove_at(index)
	accuracies.remove_at(index)
	if count() < 3:
		closed = false

func centroid() -> Vector2:
	return Geo.centroid(latitudes, longitudes)

func geojson_ring() -> Array:
	var ring: Array = []
	for i in count():
		ring.append([longitudes[i], latitudes[i]])
	if closed and count() > 0:
		ring.append([longitudes[0], latitudes[0]])
	return ring

func self_intersects() -> bool:
	var ring := PackedVector2Array()
	for i in count():
		ring.append(Vector2(longitudes[i], latitudes[i]))
	if closed and count() > 0:
		ring.append(Vector2(longitudes[0], latitudes[0]))
	return Geo.ring_self_intersects(ring)

func catmull_samples(steps: int) -> PackedVector2Array:
	var out := PackedVector2Array()
	var n := count()
	if n == 0:
		return out
	if n == 1:
		out.append(Vector2(longitudes[0], latitudes[0]))
		return out
	var spans := n if closed else n - 1
	for i in spans:
		var p0 := _at(i - 1)
		var p1 := _at(i)
		var p2 := _at(i + 1)
		var p3 := _at(i + 2)
		for s in steps:
			var t := float(s) / float(steps)
			out.append(_catmull(p0, p1, p2, p3, t))
	out.append(_at(0) if closed else _at(n - 1))
	return out

func _at(index: int) -> Vector2:
	var n := count()
	if closed:
		index = posmod(index, n)
	else:
		index = clampi(index, 0, n - 1)
	return Vector2(longitudes[index], latitudes[index])

func _catmull(p0: Vector2, p1: Vector2, p2: Vector2, p3: Vector2, t: float) -> Vector2:
	var t2 := t * t
	var t3 := t2 * t
	return 0.5 * ((2.0 * p1) + (-p0 + p2) * t + (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t2 + (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * t3)
