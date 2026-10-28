extends Node

signal request_finished(request_id: String, status: int, body: String)
signal passkey_changed(account_id: String)
signal presence_changed(state: String)

var boundary := Boundary.new()
var nearby: Array = []
var account_id := ""
var credential_id := ""
var plugin: Object
var _callbacks := {}
var _next_id := 1

func _ready() -> void:
	if Engine.has_singleton("RwaaPlugin"):
		plugin = Engine.get_singleton("RwaaPlugin")
		plugin.connect("passkey_ready", _on_passkey_ready)
		plugin.connect("passkey_failed", _on_passkey_failed)
		plugin.connect("request_finished", _on_request_finished)
		plugin.connect("presence_state", _on_presence_state)
		plugin.configure(RwaaConfig.API_BASE, RwaaConfig.API_TOKEN)
		if plugin.hasPasskey():
			account_id = plugin.getAccountId()
			credential_id = plugin.getCredentialId()

func create_passkey() -> void:
	if plugin == null:
		passkey_changed.emit("")
		push_error("RwaaPlugin is only available in the Android export")
		return
	plugin.createOrGetPasskey()

func request(method: String, path: String, body: String, callback: Callable) -> void:
	if plugin == null:
		callback.call(0, "RwaaPlugin is only available in the Android export")
		return
	var request_id := str(_next_id)
	_next_id += 1
	_callbacks[request_id] = callback
	plugin.authorizedRequest(request_id, method, path, body)

func start_presence(lat: float, lng: float) -> void:
	if plugin == null:
		return
	plugin.startPresence(lat, lng, RwaaConfig.HOME_RADIUS_M)

func stop_presence() -> void:
	if plugin == null:
		return
	plugin.stopPresence()

func save_parcel(callback: Callable) -> void:
	if not boundary.closed or boundary.count() < 3:
		callback.call(400, "Close the ring before saving")
		return
	if boundary.self_intersects():
		callback.call(400, "The ring crosses itself")
		return
	var payload := {"ring": boundary.geojson_ring()}
	request("POST", "/v1/parcels", JSON.stringify(payload), callback)

func load_nearby(lat: float, lng: float, callback: Callable) -> void:
	var path := "/v1/parcels/nearby?lat=%s&lng=%s&radiusM=%s" % [lat, lng, int(RwaaConfig.NEARBY_RADIUS_M)]
	request("GET", path, "", callback)

func apply_nearby(body: String) -> void:
	var parsed = JSON.parse_string(body)
	if typeof(parsed) != TYPE_DICTIONARY:
		return
	nearby.clear()
	for parcel in parsed.get("parcels", []):
		var ring := PackedVector2Array()
		for coord in parcel.get("ring", []):
			ring.append(Vector2(float(coord[0]), float(coord[1])))
		nearby.append(ring)

func _on_passkey_ready(next_account: String, next_credential: String) -> void:
	account_id = next_account
	credential_id = next_credential
	passkey_changed.emit(account_id)

func _on_passkey_failed(message: String) -> void:
	push_error(message)
	passkey_changed.emit(account_id)

func _on_request_finished(request_id: String, status: int, body: String) -> void:
	var callback: Callable = _callbacks.get(request_id)
	_callbacks.erase(request_id)
	request_finished.emit(request_id, status, body)
	if callback != null and callback.is_valid():
		callback.call(status, body)

func _on_presence_state(state: String) -> void:
	presence_changed.emit(state)
