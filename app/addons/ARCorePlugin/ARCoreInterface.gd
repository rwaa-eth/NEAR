@tool
extends Node

# This is the autoload that is set up when enabling the plugin
# It also communicates between ARCore and Godot
var arcore_interface

func _enter_tree():
	if not ClassDB.class_exists("ARCoreInterface"):
		return
	arcore_interface = ARCoreInterface.new()

	if arcore_interface:
		XRServer.add_interface(arcore_interface)

func _exit_tree():
	if arcore_interface:
		XRServer.remove_interface(arcore_interface)
		arcore_interface = null

func get_interface():
	return arcore_interface

func start():
	if arcore_interface and arcore_interface.initialize():
		get_viewport().use_xr = true

func get_tracking_status():
	if arcore_interface == null:
		return 0
	return arcore_interface.get_tracking_status()

func enable_geospatial(toggled):
	if arcore_interface:
		arcore_interface.enable_geospatial(toggled)

func is_geospatial_supported():
	if arcore_interface:
		return arcore_interface.is_geospatial_supported()
	return false

func get_camera_geospatial_pose():
	if arcore_interface:
		return arcore_interface.get_camera_geospatial_pose()
	return {"tracking": false}

func create_earth_anchor(latitude, longitude, altitude):
	if arcore_interface:
		return arcore_interface.create_earth_anchor(latitude, longitude, altitude)
	return -1

func get_earth_anchor_transform(anchor_id):
	if arcore_interface:
		return arcore_interface.get_earth_anchor_transform(anchor_id)
	return Transform3D()

func is_earth_anchor_tracking(anchor_id):
	if arcore_interface:
		return arcore_interface.is_earth_anchor_tracking(anchor_id)
	return false

func detach_earth_anchor(anchor_id):
	if arcore_interface:
		arcore_interface.detach_earth_anchor(anchor_id)

func get_geospatial_transform(latitude, longitude, altitude):
	if arcore_interface:
		return arcore_interface.get_geospatial_transform(latitude, longitude, altitude)
	return Transform3D()

func get_pose_geospatial(transform):
	if arcore_interface:
		return arcore_interface.get_pose_geospatial(transform)
	return {"tracking": false}

func get_hit_pose(pixel_x, pixel_y, approximate_distance_meters):
	if arcore_interface:
		return arcore_interface.getHitPose(pixel_x, pixel_y, approximate_distance_meters)
	return Transform3D()

func enable_depth_estimation(toggled):
	if arcore_interface:
		arcore_interface.enable_depth_estimation(toggled)

func show_depth_map(toggled):
	if arcore_interface:
		arcore_interface.show_depth_map(toggled)

func set_max_depth_meters(value):
	if arcore_interface:
		arcore_interface.set_max_depth_meters(value)

func enable_vertical_plane_detection(toggled):
	if arcore_interface:
		arcore_interface.enable_vertical_plane_detection(toggled)

func enable_horizontal_plane_detection(toggled):
	if arcore_interface:
		arcore_interface.enable_horizontal_plane_detection(toggled)

func enable_images_detection(toggled):
	if arcore_interface:
		arcore_interface.enable_images_detection(toggled)

func enable_instant_placement(toggled):
	if arcore_interface:
		arcore_interface.enable_instant_placement(toggled)

func enable_light_estimation(toggled):
	if arcore_interface:
		arcore_interface.enable_light_estimation(toggled)

func enable_point_cloud_detection(toggled):
	if arcore_interface:
		arcore_interface.enable_light_estimation(toggled)

func switch_orientation(vertical):
	if arcore_interface:
		arcore_interface.switch_orientation(vertical)

func get_light_main_hdr_direction():
	if arcore_interface:
		return arcore_interface.get_light_main_hdr_direction()

func get_light_main_hdr_intensity():
	if arcore_interface:
		return arcore_interface.get_light_main_hdr_intensity()
