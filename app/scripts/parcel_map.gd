extends Control
class_name ParcelMap

signal vertex_selected(index: int)
signal vertex_moved(index: int)
signal vertex_inserted(index: int)

const TILE := 256

var zoom := 16
var center_lat := 0.0
var center_lng := 0.0
var has_center := false
var boundary: Boundary
var nearby: Array = []
var selected := -1
var editable := false

var _textures := {}
var _queue: Array = []
var _active := 0
var _http_pool: Array[HTTPRequest] = []

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_STOP
	for i in 4:
		var http := HTTPRequest.new()
		http.timeout = 12.0
		add_child(http)
		http.request_completed.connect(_on_tile.bind(http))
		_http_pool.append(http)

func set_view(lat: float, lng: float) -> void:
	center_lat = lat
	center_lng = lng
	has_center = true
	_request_visible_tiles()
	queue_redraw()

func _process(_delta: float) -> void:
	if has_center:
		_pump_tiles()

func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color(0.12, 0.16, 0.14))
	if not has_center:
		draw_string(ThemeDB.fallback_font, size * 0.5 - Vector2(70, 0), "Waiting for a fix", HORIZONTAL_ALIGNMENT_LEFT, -1, 16, Color.WHITE)
		return
	var origin := Geo.world_pixel(center_lat, center_lng, zoom)
	var top_left := origin - size * 0.5
	for key in _textures.keys():
		var parts: PackedStringArray = key.split("/")
		if parts.size() != 3 or int(parts[0]) != zoom:
			continue
		var tx := int(parts[1])
		var ty := int(parts[2])
		var corner := Vector2(tx * TILE, ty * TILE) - top_left
		draw_texture_rect(_textures[key], Rect2(corner, Vector2(TILE, TILE)), false)
	for ring in nearby:
		_draw_ring(ring, Color(0.35, 0.65, 1.0, 0.9), top_left, false)
	if boundary != null and boundary.count() > 0:
		var ring := PackedVector2Array()
		for i in boundary.count():
			ring.append(Vector2(boundary.longitudes[i], boundary.latitudes[i]))
		if boundary.closed:
			ring.append(ring[0])
		_draw_ring(ring, Color(0.2, 0.95, 0.45), top_left, true)
		for i in boundary.count():
			var local := _to_local_pixel(boundary.latitudes[i], boundary.longitudes[i], top_left)
			var color := Color(1, 0.85, 0.2) if i == selected else Color.WHITE
			draw_circle(local, 7.0 if i == selected else 5.0, color)

func _draw_ring(ring: PackedVector2Array, color: Color, top_left: Vector2, smooth: bool) -> void:
	var draw_pts := ring
	if smooth and boundary != null and ring.size() >= 2:
		draw_pts = boundary.catmull_samples(6)
	if draw_pts.size() < 2:
		return
	var prev := _lnglat_to_local(draw_pts[0], top_left)
	for i in range(1, draw_pts.size()):
		var nxt := _lnglat_to_local(draw_pts[i], top_left)
		draw_line(prev, nxt, color, 3.0, true)
		prev = nxt

func _lnglat_to_local(lnglat: Vector2, top_left: Vector2) -> Vector2:
	return _to_local_pixel(lnglat.y, lnglat.x, top_left)

func _to_local_pixel(lat: float, lng: float, top_left: Vector2) -> Vector2:
	return Geo.world_pixel(lat, lng, zoom) - top_left

func _local_to_latlng(local: Vector2) -> Vector2:
	var origin := Geo.world_pixel(center_lat, center_lng, zoom)
	var pixel := local + origin - size * 0.5
	return Geo.pixel_to_latlng(pixel, zoom)

func _gui_input(event: InputEvent) -> void:
	if not editable or boundary == null or not has_center:
		return
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var hit := _pick_vertex(event.position)
		if hit >= 0:
			selected = hit
			vertex_selected.emit(hit)
			accept_event()
			queue_redraw()
			return
		var edge := _pick_edge(event.position)
		if edge >= 0:
			var lnglat := _local_to_latlng(event.position)
			var inserted := boundary.insert_after(edge, lnglat.y, lnglat.x)
			selected = inserted
			vertex_inserted.emit(inserted)
			accept_event()
			queue_redraw()
	elif event is InputEventMouseMotion and selected >= 0 and (event.button_mask & MOUSE_BUTTON_MASK_LEFT) != 0:
		var lnglat := _local_to_latlng(event.position)
		boundary.move_vertex(selected, lnglat.y, lnglat.x)
		vertex_moved.emit(selected)
		accept_event()
		queue_redraw()
	elif event is InputEventScreenTouch and event.pressed:
		var hit := _pick_vertex(event.position)
		if hit >= 0:
			selected = hit
			vertex_selected.emit(hit)
			accept_event()
			queue_redraw()
		else:
			var edge := _pick_edge(event.position)
			if edge >= 0:
				var lnglat := _local_to_latlng(event.position)
				selected = boundary.insert_after(edge, lnglat.y, lnglat.x)
				vertex_inserted.emit(selected)
				accept_event()
				queue_redraw()
	elif event is InputEventScreenDrag and selected >= 0:
		var lnglat := _local_to_latlng(event.position)
		boundary.move_vertex(selected, lnglat.y, lnglat.x)
		vertex_moved.emit(selected)
		accept_event()
		queue_redraw()

func _pick_vertex(local: Vector2) -> int:
	var origin := Geo.world_pixel(center_lat, center_lng, zoom)
	var top_left := origin - size * 0.5
	var best := -1
	var best_d := 18.0
	for i in boundary.count():
		var d := local.distance_to(_to_local_pixel(boundary.latitudes[i], boundary.longitudes[i], top_left))
		if d < best_d:
			best_d = d
			best = i
	return best

func _pick_edge(local: Vector2) -> int:
	if boundary.count() < 2:
		return -1
	var origin := Geo.world_pixel(center_lat, center_lng, zoom)
	var top_left := origin - size * 0.5
	var best := -1
	var best_d := 16.0
	var last := boundary.count() if boundary.closed else boundary.count() - 1
	for i in last:
		var a := _to_local_pixel(boundary.latitudes[i], boundary.longitudes[i], top_left)
		var j := 0 if boundary.closed and i == boundary.count() - 1 else i + 1
		if not boundary.closed and i == boundary.count() - 1:
			continue
		var b := _to_local_pixel(boundary.latitudes[j], boundary.longitudes[j], top_left)
		var d := _distance_to_segment(local, a, b)
		if d < best_d:
			best_d = d
			best = i
	return best

func _distance_to_segment(p: Vector2, a: Vector2, b: Vector2) -> float:
	var ab := b - a
	var denom := ab.length_squared()
	if denom <= 0.0001:
		return p.distance_to(a)
	var t := clampf((p - a).dot(ab) / denom, 0.0, 1.0)
	return p.distance_to(a + ab * t)

func _request_visible_tiles() -> void:
	var origin := Geo.world_pixel(center_lat, center_lng, zoom)
	var top_left := origin - size * 0.5
	var max_index := int(pow(2.0, zoom))
	var x0 := clampi(int(floor(top_left.x / TILE)), 0, max_index - 1)
	var y0 := clampi(int(floor(top_left.y / TILE)), 0, max_index - 1)
	var x1 := clampi(int(floor((top_left.x + size.x) / TILE)), 0, max_index - 1)
	var y1 := clampi(int(floor((top_left.y + size.y) / TILE)), 0, max_index - 1)
	for tx in range(x0, x1 + 1):
		for ty in range(y0, y1 + 1):
			var key := "%d/%d/%d" % [zoom, tx, ty]
			if _textures.has(key) or _queue.has(key):
				continue
			_queue.append(key)

func _pump_tiles() -> void:
	for http in _http_pool:
		if _active >= 4:
			return
		if http.get_meta("busy", false):
			continue
		if _queue.is_empty():
			return
		var key: String = _queue.pop_front()
		var parts := key.split("/")
		var url := "https://tile.openstreetmap.org/%s/%s/%s.png" % [parts[0], parts[1], parts[2]]
		http.set_meta("busy", true)
		http.set_meta("key", key)
		var err := http.request(url, ["User-Agent: " + RwaaConfig.TILE_USER_AGENT])
		if err != OK:
			http.set_meta("busy", false)
			continue
		_active += 1

func _on_tile(result: int, code: int, _headers: PackedStringArray, body: PackedByteArray, http: HTTPRequest) -> void:
	_active = max(0, _active - 1)
	var key: String = http.get_meta("key", "")
	http.set_meta("busy", false)
	if result != HTTPRequest.RESULT_SUCCESS or code != 200:
		return
	var image := Image.new()
	if image.load_png_from_buffer(body) != OK:
		return
	_textures[key] = ImageTexture.create_from_image(image)
	queue_redraw()
