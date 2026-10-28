@tool
extends EditorPlugin

var export_plugin: AndroidExportPlugin

func _enter_tree():
	export_plugin = AndroidExportPlugin.new()
	add_export_plugin(export_plugin)

func _exit_tree():
	remove_export_plugin(export_plugin)
	export_plugin = null

class AndroidExportPlugin extends EditorExportPlugin:
	var _plugin_name = "RwaaPlugin"

	func _supports_platform(platform):
		return platform is EditorExportPlatformAndroid

	func _get_android_libraries(_platform, debug):
		if debug:
			return PackedStringArray([_plugin_name + "/bin/debug/" + _plugin_name + "-debug.aar"])
		return PackedStringArray([_plugin_name + "/bin/release/" + _plugin_name + "-release.aar"])

	func _get_android_dependencies(_platform, _debug):
		return PackedStringArray([
			"androidx.credentials:credentials:1.3.0",
			"androidx.credentials:credentials-play-services-auth:1.3.0",
			"androidx.activity:activity-ktx:1.9.2",
			"androidx.lifecycle:lifecycle-runtime-ktx:2.8.6",
			"com.google.android.gms:play-services-location:21.3.0",
			"org.bouncycastle:bcprov-jdk18on:1.78.1",
			"com.squareup.okhttp3:okhttp:4.12.0",
			"org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1",
		])

	func _get_name():
		return _plugin_name
