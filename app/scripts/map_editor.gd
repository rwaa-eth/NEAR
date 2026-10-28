extends Control

var _status: Label
var _map: ParcelMap

func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var column := VBoxContainer.new()
	column.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	column.offset_left = 8
	column.offset_top = 8
	column.offset_right = -8
	column.offset_bottom = -8
	add_child(column)

	var row := HBoxContainer.new()
	column.add_child(row)
	_button(row, "Back", func(): get_tree().change_scene_to_file("res://scenes/main.tscn"))
	_button(row, "Close ring", func():
		if Rwaa.boundary.close():
			_status.text = "Ring closed"
		else:
			_status.text = "Need at least 3 vertices"
		_map.queue_redraw()
	)
	_button(row, "Delete vertex", func():
		Rwaa.boundary.remove_vertex(_map.selected)
		_map.selected = -1
		_map.queue_redraw()
	)
	_button(row, "Save", _save)

	_status = Label.new()
	_status.text = "Drag a vertex. Tap a segment to insert one. The smooth line is only the drawing."
	_status.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	column.add_child(_status)

	_map = ParcelMap.new()
	_map.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_map.boundary = Rwaa.boundary
	_map.nearby = Rwaa.nearby
	_map.editable = true
	_map.zoom = 18
	column.add_child(_map)
	_map.vertex_moved.connect(func(_index): _status.text = "Vertex moved")
	_map.vertex_inserted.connect(func(_index): _status.text = "Vertex inserted")

	if Rwaa.boundary.count() > 0:
		await get_tree().process_frame
		var center := Rwaa.boundary.centroid()
		_map.set_view(center.y, center.x)
		Rwaa.load_nearby(center.y, center.x, func(status: int, body: String):
			if status == 200:
				Rwaa.apply_nearby(body)
				_map.nearby = Rwaa.nearby
				_map.queue_redraw()
		)
	else:
		_status.text = "No vertices yet. Walk the boundary first, or wait for a fix and drop points in AR."

func _button(parent: Node, text: String, handler: Callable) -> void:
	var button := Button.new()
	button.text = text
	button.pressed.connect(handler)
	parent.add_child(button)

func _save() -> void:
	Rwaa.save_parcel(func(status: int, body: String):
		if status >= 200 and status < 300:
			_status.text = "Saved"
		else:
			_status.text = body
	)
