extends Node3D

var _status: Label
var _map: ParcelMap
var _ribbon: MeshInstance3D
var _others: MeshInstance3D
var _walking := false
var _edit := false
var _selected := -1
var _anchor_ids: Array[int] = []
var _sample_wait := 0.0
var _redraw_wait := 0.0
var _nearby_wait := 0.0
var _last_pose := {}

func _ready() -> void:
	var origin := XROrigin3D.new()
	var camera := XRCamera3D.new()
	camera.current = true
	origin.add_child(camera)
	add_child(origin)

	_ribbon = MeshInstance3D.new()
	_ribbon.material_override = _line_material(Color(0.15, 0.95, 0.4))
	add_child(_ribbon)
	_others = MeshInstance3D.new()
	_others.material_override = _line_material(Color(0.35, 0.7, 1.0))
	add_child(_others)

	var layer := CanvasLayer.new()
	add_child(layer)
	var column := VBoxContainer.new()
	column.set_anchors_preset(Control.PRESET_FULL_RECT)
	column.offset_left = 12
	column.offset_top = 12
	column.offset_right = -12
	column.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.add_child(column)

	_status = Label.new()
	_status.text = "Starting AR"
	_status.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	column.add_child(_status)

	var row := HBoxContainer.new()
	column.add_child(row)
	_button(row, "Walk", func():
		_walking = not Rwaa.boundary.closed
		_edit = false
		_status.text = "Walk the boundary" if _walking else "Walk paused"
	)
	_button(row, "Close", func():
		if Rwaa.boundary.close():
			_walking = false
			_status.text = "Ring closed"
		else:
			_status.text = "Need at least 3 vertices"
	)
	_button(row, "Drop", _drop_here)
	_button(row, "Edit", func():
		_edit = not _edit
		_walking = false
		_status.text = "Drag a vertex" if _edit else "Edit off"
	)
	_button(row, "Save", _save)
	_button(row, "Map", func(): get_tree().change_scene_to_file("res://scenes/map_editor.tscn"))
	_button(row, "Back", func(): get_tree().change_scene_to_file("res://scenes/main.tscn"))

	_map = ParcelMap.new()
	_map.custom_minimum_size = Vector2(220, 220)
	_map.boundary = Rwaa.boundary
	_map.editable = false
	_map.zoom = 17
	column.add_child(_map)

	ARCoreInterfaceInstance.enable_horizontal_plane_detection(true)
	ARCoreInterfaceInstance.enable_instant_placement(true)
	ARCoreInterfaceInstance.enable_geospatial(true)
	ARCoreInterfaceInstance.start()
	if ARCoreInterfaceInstance.get_interface() == null:
		_status.text = "ARCore is unavailable in the desktop editor"

func _button(parent: Node, text: String, handler: Callable) -> void:
	var button := Button.new()
	button.text = text
	button.pressed.connect(handler)
	parent.add_child(button)

func _line_material(color: Color) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	material.albedo_color = color
	material.cull_mode = BaseMaterial3D.CULL_DISABLED
	return material

func _process(delta: float) -> void:
	_sample_wait -= delta
	_redraw_wait -= delta
	_nearby_wait -= delta
	if _sample_wait <= 0.0:
		_sample_wait = 1.0
		_sample()
	if _redraw_wait <= 0.0:
		_redraw_wait = 0.15
		_redraw()

func _sample() -> void:
	var pose: Dictionary = ARCoreInterfaceInstance.get_camera_geospatial_pose()
	_last_pose = pose
	if not pose.get("tracking", false):
		_status.text = "Map is live. AR lock waits for an Earth pose."
		return
	var lat := float(pose["latitude"])
	var lng := float(pose["longitude"])
	var accuracy := float(pose["horizontal_accuracy"])
	_map.set_view(lat, lng)
	if _nearby_wait <= 0.0:
		_nearby_wait = 20.0
		_load_nearby(lat, lng)
	if not _walking or Rwaa.boundary.closed:
		_status.text = "Locked, accuracy %.0f m, %d vertices" % [accuracy, Rwaa.boundary.count()]
		return
	var added := Rwaa.boundary.try_add(lat, lng, accuracy)
	if added == "added":
		_anchor_vertex(Rwaa.boundary.count() - 1, lat, lng, float(pose["altitude"]) - 1.5)
	elif added == "coarse":
		_status.text = "Accuracy %.0f m is coarser than 10 m" % accuracy
		return
	if Rwaa.boundary.near_start(lat, lng):
		Rwaa.boundary.close()
		_walking = false
		_status.text = "Returned to the start. Ring closed."
		return
	_status.text = "Walking, %d vertices, accuracy %.0f m" % [Rwaa.boundary.count(), accuracy]

func _drop_here() -> void:
	if Rwaa.boundary.closed:
		_status.text = "Ring is already closed"
		return
	if not _last_pose.get("tracking", false):
		_status.text = "No Earth pose yet"
		return
	var lat := float(_last_pose["latitude"])
	var lng := float(_last_pose["longitude"])
	var accuracy := float(_last_pose["horizontal_accuracy"])
	if accuracy > Boundary.MAX_ACCURACY_M:
		_status.text = "Accuracy %.0f m is coarser than 10 m" % accuracy
		return
	Rwaa.boundary.latitudes.append(lat)
	Rwaa.boundary.longitudes.append(lng)
	Rwaa.boundary.accuracies.append(accuracy)
	_anchor_vertex(Rwaa.boundary.count() - 1, lat, lng, float(_last_pose["altitude"]) - 1.5)
	_status.text = "Dropped vertex %d" % Rwaa.boundary.count()

func _anchor_vertex(index: int, lat: float, lng: float, altitude: float) -> void:
	while _anchor_ids.size() <= index:
		_anchor_ids.append(-1)
	if _anchor_ids[index] >= 0:
		ARCoreInterfaceInstance.detach_earth_anchor(_anchor_ids[index])
	_anchor_ids[index] = ARCoreInterfaceInstance.create_earth_anchor(lat, lng, altitude)

func _redraw() -> void:
	_map.nearby = Rwaa.nearby
	_map.queue_redraw()
	if not _last_pose.get("tracking", false):
		_ribbon.visible = false
		_others.visible = false
		return
	var altitude := float(_last_pose["altitude"]) - 1.5
	_ribbon.mesh = _mesh_from_lnglat(Rwaa.boundary.catmull_samples(8), altitude)
	_ribbon.visible = _ribbon.mesh != null
	var meshes_ready := false
	var immediate := ImmediateMesh.new()
	for ring in Rwaa.nearby:
		if ring.size() < 2:
			continue
		immediate.surface_begin(Mesh.PRIMITIVE_TRIANGLE_STRIP)
		_append_ribbon(immediate, _world_points(ring, altitude))
		immediate.surface_end()
		meshes_ready = true
	_others.mesh = immediate if meshes_ready else null
	_others.visible = meshes_ready

func _mesh_from_lnglat(samples: PackedVector2Array, altitude: float) -> ImmediateMesh:
	if samples.size() < 2:
		return null
	var mesh := ImmediateMesh.new()
	mesh.surface_begin(Mesh.PRIMITIVE_TRIANGLE_STRIP)
	_append_ribbon(mesh, _world_points(samples, altitude))
	mesh.surface_end()
	return mesh

func _world_points(samples: PackedVector2Array, altitude: float) -> PackedVector3Array:
	var points := PackedVector3Array()
	for sample in samples:
		var xf: Transform3D = ARCoreInterfaceInstance.get_geospatial_transform(sample.y, sample.x, altitude)
		points.append(xf.origin)
	return points

func _append_ribbon(mesh: ImmediateMesh, points: PackedVector3Array) -> void:
	if points.size() < 2:
		return
	for i in points.size():
		var tangent := Vector3.RIGHT
		if i < points.size() - 1:
			tangent = points[i + 1] - points[i]
		else:
			tangent = points[i] - points[i - 1]
		tangent.y = 0.0
		if tangent.length() < 0.001:
			tangent = Vector3.RIGHT
		var side := tangent.normalized().cross(Vector3.UP) * 0.08
		mesh.surface_add_vertex(points[i] - side)
		mesh.surface_add_vertex(points[i] + side)

func _load_nearby(lat: float, lng: float) -> void:
	Rwaa.load_nearby(lat, lng, func(status: int, body: String):
		if status == 200:
			Rwaa.apply_nearby(body)
	)

func _save() -> void:
	Rwaa.save_parcel(func(status: int, body: String):
		if status >= 200 and status < 300:
			_status.text = "Saved"
		else:
			_status.text = body
	)

func _unhandled_input(event: InputEvent) -> void:
	if not _edit or not _last_pose.get("tracking", false):
		return
	var pressed := false
	var position := Vector2.ZERO
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		pressed = event.pressed
		position = event.position
		if not pressed:
			return
	elif event is InputEventScreenTouch:
		pressed = event.pressed
		position = event.position
		if not pressed:
			_selected = -1
			return
	elif event is InputEventMouseMotion and (event.button_mask & MOUSE_BUTTON_MASK_LEFT) != 0:
		_drag(event.position)
		return
	elif event is InputEventScreenDrag:
		_drag(event.position)
		return
	else:
		return
	if not pressed:
		return
	_selected = _pick_vertex(position)
	if _selected >= 0:
		_drag(position)

func _pick_vertex(screen: Vector2) -> int:
	var camera := get_viewport().get_camera_3d()
	if camera == null:
		return -1
	var altitude := float(_last_pose["altitude"]) - 1.5
	var best := -1
	var best_d := 48.0
	for i in Rwaa.boundary.count():
		var xf: Transform3D = ARCoreInterfaceInstance.get_geospatial_transform(Rwaa.boundary.latitudes[i], Rwaa.boundary.longitudes[i], altitude)
		if camera.is_position_behind(xf.origin):
			continue
		var projected := camera.unproject_position(xf.origin)
		var d := screen.distance_to(projected)
		if d < best_d:
			best_d = d
			best = i
	return best

func _drag(screen: Vector2) -> void:
	if _selected < 0:
		return
	var hit: Transform3D = ARCoreInterfaceInstance.get_hit_pose(screen.x, screen.y, 2.0)
	if hit.origin == Vector3.ZERO:
		return
	var geo: Dictionary = ARCoreInterfaceInstance.get_pose_geospatial(hit)
	if not geo.get("tracking", false):
		return
	var lat := float(geo["latitude"])
	var lng := float(geo["longitude"])
	Rwaa.boundary.move_vertex(_selected, lat, lng)
	_anchor_vertex(_selected, lat, lng, float(geo["altitude"]))
