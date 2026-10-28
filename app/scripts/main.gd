extends Control

var _account: Label
var _status: Label
var _presence: Label

func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var box := VBoxContainer.new()
	box.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	box.offset_left = 24
	box.offset_top = 36
	box.offset_right = -24
	box.offset_bottom = -24
	box.add_theme_constant_override("separation", 12)
	add_child(box)

	var title := Label.new()
	title.text = "RWAA"
	title.add_theme_font_size_override("font_size", 32)
	box.add_child(title)

	var subtitle := Label.new()
	subtitle.text = "Walk a land boundary. The same passkey signs in at rwaa.percolate.one."
	subtitle.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	box.add_child(subtitle)

	_account = Label.new()
	_account.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	box.add_child(_account)

	_status = Label.new()
	_status.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	box.add_child(_status)

	_presence = Label.new()
	_presence.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	box.add_child(_presence)

	_add_button(box, "Create passkey", _on_passkey)
	_add_button(box, "Walk boundary", func(): get_tree().change_scene_to_file("res://scenes/walk.tscn"))
	_add_button(box, "Edit on map", func(): get_tree().change_scene_to_file("res://scenes/map_editor.tscn"))
	_add_button(box, "Watch home presence", _on_presence)
	_add_button(box, "Stop presence watch", func():
		Rwaa.stop_presence()
		_presence.text = "Presence watch stopped"
	)

	Rwaa.passkey_changed.connect(_show_account)
	Rwaa.presence_changed.connect(func(state: String): _presence.text = state)
	_show_account(Rwaa.account_id)
	if Rwaa.plugin == null:
		_status.text = "Passkey, save, and presence run in the Android export. The map editor still edits the ring on this machine."

func _add_button(parent: Node, text: String, handler: Callable) -> void:
	var button := Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(0, 48)
	button.pressed.connect(handler)
	parent.add_child(button)

func _show_account(account_id: String) -> void:
	if account_id.is_empty():
		_account.text = "No NEAR account yet"
	else:
		_account.text = "NEAR account\n" + account_id

func _on_passkey() -> void:
	_status.text = "Waiting for the passkey prompt"
	Rwaa.create_passkey()

func _on_presence() -> void:
	if Rwaa.boundary.count() < 3:
		_presence.text = "Save a closed boundary first. Home is its centroid."
		return
	var center := Rwaa.boundary.centroid()
	Rwaa.start_presence(center.y, center.x)
	_presence.text = "Presence watch requested. Confirm the hourly check from the notification."
