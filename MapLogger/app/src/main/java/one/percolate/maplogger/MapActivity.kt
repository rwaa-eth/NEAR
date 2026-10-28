package one.percolate.maplogger

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.PointF
import android.graphics.RectF
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.google.android.gms.location.CurrentLocationRequest
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import one.percolate.maplogger.databinding.ActivityMapBinding
import org.maplibre.android.camera.CameraUpdateFactory
import org.maplibre.android.geometry.LatLng
import org.maplibre.android.location.LocationComponentActivationOptions
import org.maplibre.android.maps.MapLibreMap
import org.maplibre.android.maps.Style
import org.maplibre.android.style.layers.CircleLayer
import org.maplibre.android.style.layers.FillLayer
import org.maplibre.android.style.layers.LineLayer
import org.maplibre.android.style.layers.Property
import org.maplibre.android.style.layers.PropertyFactory
import org.maplibre.android.style.sources.GeoJsonSource
import org.maplibre.geojson.Feature
import org.maplibre.geojson.FeatureCollection
import org.maplibre.geojson.LineString
import org.maplibre.geojson.Point
import org.maplibre.geojson.Polygon
import kotlin.math.hypot

class MapActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMapBinding
    private val track = Track(segmentMetres = 5.0)
    private val trailSource = GeoJsonSource(TRAIL_SOURCE)
    private val boundarySource = GeoJsonSource(BOUNDARY_SOURCE)
    private val fillSource = GeoJsonSource(FILL_SOURCE)
    private val vertexSource = GeoJsonSource(VERTEX_SOURCE)
    private val limitSource = GeoJsonSource(LIMIT_SOURCE)
    private var limitLayer: CircleLayer? = null
    private val fused by lazy { LocationServices.getFusedLocationProviderClient(this) }
    private val handler = Handler(Looper.getMainLooper())
    private var map: MapLibreMap? = null
    private var styleReady = false
    private var recording = false
    private var askedPermission = false
    private var requestedOpenFix = false
    private var pendingRecord = false
    private var pendingCenter: LatLng? = null
    private var draggingId: Long? = null
    private var refining = false
    private var refinePurpose = Refine.NONE
    private var refineEndsAt = 0L
    private val refineFixes = ArrayList<android.location.Location>()

    private val locationPermission = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions(),
    ) { grants ->
        if (grants[Manifest.permission.ACCESS_FINE_LOCATION] == true) {
            enableLocationLayer()
            centerOnGps()
            if (pendingRecord) {
                pendingRecord = false
                startRefine(Refine.START)
            }
        } else {
            pendingRecord = false
            recording = false
            showIdleButton()
            Toast.makeText(this, R.string.location_required, Toast.LENGTH_LONG).show()
        }
    }

    private val locationCallback = object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) {
            val fix = result.lastLocation ?: return
            if (refining) {
                refineFixes.add(fix)
                return
            }
            if (!recording) return
            if (fix.accuracy > MAX_ACCURACY_M) return
            if (draggingId == null) follow(fix.latitude, fix.longitude)
            if (track.addFix(fix.latitude, fix.longitude)) {
                redrawTrack()
            }
        }
    }

    private val refineTick = object : Runnable {
        override fun run() {
            if (!refining) return
            val secondsLeft = ((refineEndsAt - SystemClock.elapsedRealtime() + 999L) / 1000L).toInt()
            if (secondsLeft <= 0) {
                completeRefine()
            } else {
                binding.holdCountdown.text = secondsLeft.toString()
                handler.postDelayed(this, 200L)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMapBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.map.onCreate(savedInstanceState)
        binding.map.setOnTouchListener { _, event -> onMapTouch(event) }
        binding.map.getMapAsync { loaded ->
            map = loaded
            placeAttribution(loaded)
            loaded.setStyle(Style.Builder().fromUri(STYLE_URI)) { style ->
                styleReady = true
                installTrack(style)
                enableLocationLayer()
                pendingCenter?.let { centerOn(it.latitude, it.longitude) }
            }
        }
        binding.centerButton.setOnClickListener { centerOnGps() }
        binding.walkButton.setOnClickListener { toggleWalk() }
        binding.vertexButton.setOnClickListener { markCorner() }
        showIdleButton()
    }

    override fun onStart() {
        super.onStart()
        binding.map.onStart()
    }

    override fun onResume() {
        super.onResume()
        binding.map.onResume()
        if (hasLocationPermission()) {
            enableLocationLayer()
            if (!requestedOpenFix) {
                requestedOpenFix = true
                centerOnGps()
            }
            if (recording) startUpdates(fine = false)
        } else if (!askedPermission) {
            askedPermission = true
            requestLocationPermission(startWalk = false)
        }
    }

    override fun onPause() {
        cancelRefine()
        if (recording) {
            fused.removeLocationUpdates(locationCallback)
        }
        binding.map.onPause()
        super.onPause()
    }

    override fun onStop() {
        binding.map.onStop()
        super.onStop()
    }

    override fun onLowMemory() {
        super.onLowMemory()
        binding.map.onLowMemory()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        binding.map.onSaveInstanceState(outState)
    }

    override fun onDestroy() {
        cancelRefine()
        binding.map.onDestroy()
        super.onDestroy()
    }

    private fun toggleWalk() {
        if (refining) return
        if (!hasLocationPermission()) {
            requestLocationPermission(startWalk = true)
            return
        }
        if (recording) {
            finishLot()
        } else {
            startRefine(Refine.START)
        }
    }

    private fun finishLot() {
        if (!track.close()) {
            Toast.makeText(this, R.string.need_three_corners, Toast.LENGTH_LONG).show()
            return
        }
        recording = false
        fused.removeLocationUpdates(locationCallback)
        redrawTrack()
        showIdleButton()
        window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    }

    private fun requestLocationPermission(startWalk: Boolean) {
        pendingRecord = startWalk
        locationPermission.launch(
            arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION,
            ),
        )
    }

    private fun markCorner() {
        if (!recording || refining) return
        startRefine(Refine.VERTEX)
    }

    private fun startRefine(purpose: Refine) {
        if (refining) return
        refining = true
        refinePurpose = purpose
        refineFixes.clear()
        val message = if (purpose == Refine.START) R.string.hold_still_start else R.string.hold_still_corner
        binding.holdMessage.setText(message)
        binding.holdCountdown.text = (REFINE_MS / 1000L).toString()
        binding.holdCard.visibility = View.VISIBLE
        refineEndsAt = SystemClock.elapsedRealtime() + REFINE_MS
        startUpdates(fine = true)
        handler.post(refineTick)
    }

    private fun completeRefine() {
        if (!refining) return
        val purpose = refinePurpose
        val fix = averageFixes(refineFixes)
        refining = false
        refinePurpose = Refine.NONE
        handler.removeCallbacks(refineTick)
        binding.holdCard.visibility = View.GONE
        if (fix == null) {
            if (!recording) fused.removeLocationUpdates(locationCallback)
            Toast.makeText(this, R.string.refine_failed, Toast.LENGTH_LONG).show()
            return
        }
        when (purpose) {
            Refine.START -> {
                track.clear()
                track.addVertex(fix.latitude, fix.longitude, fix.accuracyMetres)
                recording = true
                showRecordingButton()
                startUpdates(fine = false)
                window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                redrawTrack()
            }
            Refine.VERTEX -> {
                if (!track.addVertex(fix.latitude, fix.longitude, fix.accuracyMetres)) {
                    Toast.makeText(this, R.string.corner_already_marked, Toast.LENGTH_SHORT).show()
                }
                startUpdates(fine = false)
                redrawTrack()
            }
            Refine.NONE -> Unit
        }
    }

    private fun cancelRefine() {
        if (!refining) return
        refining = false
        refinePurpose = Refine.NONE
        handler.removeCallbacks(refineTick)
        binding.holdCard.visibility = View.GONE
        if (!recording) fused.removeLocationUpdates(locationCallback)
    }

    private fun averageFixes(fixes: List<android.location.Location>): RefinedFix? {
        if (fixes.isEmpty()) return null
        val steady = fixes.filter { it.accuracy <= MAX_ACCURACY_M }
        val sample = steady.ifEmpty { listOf(fixes.minBy { it.accuracy }) }
        var weightSum = 0.0
        var latitude = 0.0
        var longitude = 0.0
        var bestAccuracy = Float.MAX_VALUE
        for (fix in sample) {
            val accuracy = fix.accuracy.coerceAtLeast(0.5f)
            val weight = 1.0 / (accuracy * accuracy)
            latitude += fix.latitude * weight
            longitude += fix.longitude * weight
            weightSum += weight
            if (fix.accuracy < bestAccuracy) bestAccuracy = fix.accuracy
        }
        if (weightSum == 0.0) return null
        return RefinedFix(latitude / weightSum, longitude / weightSum, bestAccuracy)
    }

    private fun centerOnGps() {
        if (!hasLocationPermission()) {
            requestLocationPermission(startWalk = false)
            return
        }
        val request = CurrentLocationRequest.Builder()
            .setPriority(Priority.PRIORITY_HIGH_ACCURACY)
            .setMaxUpdateAgeMillis(5_000L)
            .build()
        fused.getCurrentLocation(request, null).addOnSuccessListener { location ->
            if (location != null) centerOn(location.latitude, location.longitude)
        }
    }

    private fun centerOn(latitude: Double, longitude: Double) {
        val target = LatLng(latitude, longitude)
        val loaded = map
        if (loaded == null || !styleReady) {
            pendingCenter = target
            return
        }
        pendingCenter = null
        loaded.animateCamera(CameraUpdateFactory.newLatLngZoom(target, WALK_ZOOM))
    }

    private fun follow(latitude: Double, longitude: Double) {
        val loaded = map ?: return
        if (!styleReady) return
        loaded.animateCamera(CameraUpdateFactory.newLatLng(LatLng(latitude, longitude)))
    }

    private fun startUpdates(fine: Boolean) {
        val request = if (fine) {
            LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 500L)
                .setMinUpdateIntervalMillis(200L)
                .setMinUpdateDistanceMeters(0f)
                .build()
        } else {
            LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 1_000L)
                .setMinUpdateIntervalMillis(500L)
                .setMinUpdateDistanceMeters(1f)
                .build()
        }
        fused.requestLocationUpdates(request, locationCallback, Looper.getMainLooper())
    }

    private fun installTrack(style: Style) {
        if (style.getSource(TRAIL_SOURCE) == null) {
            style.addSource(trailSource)
            style.addSource(fillSource)
            style.addSource(boundarySource)
            style.addSource(vertexSource)
            style.addSource(limitSource)
            style.addLayer(
                LineLayer(TRAIL_LAYER, TRAIL_SOURCE).withProperties(
                    PropertyFactory.lineColor(Color.parseColor("#E53935")),
                    PropertyFactory.lineWidth(1f),
                    PropertyFactory.lineCap(Property.LINE_CAP_BUTT),
                    PropertyFactory.lineJoin(Property.LINE_JOIN_MITER),
                ),
            )
            style.addLayer(
                FillLayer(FILL_LAYER, FILL_SOURCE).withProperties(
                    PropertyFactory.fillColor(Color.parseColor("#32E875")),
                    PropertyFactory.fillOpacity(0.28f),
                ),
            )
            style.addLayer(
                LineLayer(BOUNDARY_LAYER, BOUNDARY_SOURCE).withProperties(
                    PropertyFactory.lineColor(Color.parseColor("#1B8F4A")),
                    PropertyFactory.lineWidth(2.5f),
                    PropertyFactory.lineCap(Property.LINE_CAP_ROUND),
                    PropertyFactory.lineJoin(Property.LINE_JOIN_ROUND),
                ),
            )
            val ring = CircleLayer(LIMIT_LAYER, LIMIT_SOURCE).withProperties(
                PropertyFactory.circleColor(Color.parseColor("#1B8F4A")),
                PropertyFactory.circleOpacity(0.12f),
                PropertyFactory.circleStrokeColor(Color.parseColor("#1B8F4A")),
                PropertyFactory.circleStrokeWidth(1.5f),
                PropertyFactory.circleStrokeOpacity(0.8f),
                PropertyFactory.circleRadius(0f),
            )
            limitLayer = ring
            style.addLayer(ring)
            style.addLayer(
                CircleLayer(VERTEX_LAYER, VERTEX_SOURCE).withProperties(
                    PropertyFactory.circleRadius(7f),
                    PropertyFactory.circleColor(Color.WHITE),
                    PropertyFactory.circleStrokeWidth(2.5f),
                    PropertyFactory.circleStrokeColor(Color.parseColor("#14241C")),
                ),
            )
        }
        redrawTrack()
    }

    private fun redrawTrack() {
        drawLine(trailSource, track.points(), closeRing = false)
        val corners = track.vertices().map { it.position }
        drawLine(boundarySource, corners, closeRing = track.isClosed())
        if (track.isClosed() && corners.size >= 3) {
            val ring = (corners + corners.first()).map { Point.fromLngLat(it.longitude, it.latitude) }
            fillSource.setGeoJson(Feature.fromGeometry(Polygon.fromLngLats(listOf(ring))))
        } else {
            fillSource.setGeoJson(FeatureCollection.fromFeatures(emptyArray()))
        }
        val features = track.vertices().map { vertex ->
            Feature.fromGeometry(Point.fromLngLat(vertex.position.longitude, vertex.position.latitude)).also {
                it.addStringProperty(VERTEX_ID, vertex.id.toString())
            }
        }
        vertexSource.setGeoJson(FeatureCollection.fromFeatures(features.toTypedArray()))
    }

    private fun drawLine(source: GeoJsonSource, points: List<one.percolate.maplogger.LatLng>, closeRing: Boolean) {
        val drawn = if (closeRing && points.size >= 2) points + points.first() else points
        if (drawn.size < 2) {
            source.setGeoJson(FeatureCollection.fromFeatures(emptyArray()))
            return
        }
        source.setGeoJson(
            Feature.fromGeometry(
                LineString.fromLngLats(drawn.map { Point.fromLngLat(it.longitude, it.latitude) }),
            ),
        )
    }

    private fun onMapTouch(event: MotionEvent): Boolean {
        val loaded = map ?: return false
        if (!styleReady || refining) return false
        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                val hit = vertexAt(loaded, event.x, event.y) ?: return false
                draggingId = hit
                setMapGesturesEnabled(false)
                showElasticLimit(hit)
                return true
            }
            MotionEvent.ACTION_MOVE -> {
                val id = draggingId ?: return false
                val finger = loaded.projection.fromScreenLocation(PointF(event.x, event.y))
                track.dragVertex(id, finger.latitude, finger.longitude)
                redrawTrack()
                return true
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                val id = draggingId ?: return false
                track.releaseVertex(id)
                draggingId = null
                hideElasticLimit()
                redrawTrack()
                setMapGesturesEnabled(true)
                return true
            }
        }
        return false
    }

    private fun vertexAt(loaded: MapLibreMap, x: Float, y: Float): Long? {
        val slop = 28f * resources.displayMetrics.density
        val box = RectF(x - slop, y - slop, x + slop, y + slop)
        val features = loaded.queryRenderedFeatures(box, VERTEX_LAYER)
        if (features.isEmpty()) return null
        val touch = PointF(x, y)
        return features.mapNotNull { feature ->
            val id = feature.getStringProperty(VERTEX_ID)?.toLongOrNull() ?: return@mapNotNull null
            val geometry = feature.geometry() as? Point ?: return@mapNotNull null
            val screen = loaded.projection.toScreenLocation(
                LatLng(geometry.latitude(), geometry.longitude()),
            )
            id to hypot((screen.x - touch.x).toDouble(), (screen.y - touch.y).toDouble())
        }.minByOrNull { it.second }?.first
    }

    private fun showElasticLimit(id: Long) {
        val vertex = track.vertices().find { it.id == id } ?: return
        val loaded = map ?: return
        limitSource.setGeoJson(Point.fromLngLat(vertex.recorded.longitude, vertex.recorded.latitude))
        val edge = Track.destination(vertex.recorded, vertex.elasticMetres, 90.0)
        val center = loaded.projection.toScreenLocation(LatLng(vertex.recorded.latitude, vertex.recorded.longitude))
        val rim = loaded.projection.toScreenLocation(LatLng(edge.latitude, edge.longitude))
        val pixels = hypot((rim.x - center.x).toDouble(), (rim.y - center.y).toDouble()).toFloat()
        limitLayer?.setProperties(PropertyFactory.circleRadius(pixels))
    }

    private fun hideElasticLimit() {
        limitSource.setGeoJson(FeatureCollection.fromFeatures(emptyArray()))
        limitLayer?.setProperties(PropertyFactory.circleRadius(0f))
    }

    private fun setMapGesturesEnabled(enabled: Boolean) {
        map?.uiSettings?.apply {
            isScrollGesturesEnabled = enabled
            isRotateGesturesEnabled = enabled
            isZoomGesturesEnabled = enabled
            isDoubleTapGesturesEnabled = enabled
            isQuickZoomGesturesEnabled = enabled
        }
    }

    private fun enableLocationLayer() {
        val loaded = map ?: return
        val style = loaded.style ?: return
        if (!styleReady || !hasLocationPermission()) return
        val component = loaded.locationComponent
        if (!component.isLocationComponentActivated) {
            component.activateLocationComponent(
                LocationComponentActivationOptions.builder(this, style).build(),
            )
        }
        component.isLocationComponentEnabled = true
    }

    private fun placeAttribution(loaded: MapLibreMap) {
        val density = resources.displayMetrics.density
        val end = (16 * density).toInt()
        val bottom = (16 * density).toInt()
        loaded.uiSettings.apply {
            isTiltGesturesEnabled = false
            logoGravity = Gravity.BOTTOM or Gravity.END
            attributionGravity = Gravity.BOTTOM or Gravity.END
            setLogoMargins(0, 0, end, bottom + (28 * density).toInt())
            setAttributionMargins(0, 0, end, bottom)
        }
    }

    private fun showIdleButton() {
        binding.walkButton.setImageResource(R.drawable.ic_play)
        binding.walkButton.backgroundTintList = ContextCompat.getColorStateList(this, R.color.walk_go)
        binding.walkButton.contentDescription = getString(R.string.start_walk)
        binding.vertexButton.visibility = View.GONE
    }

    private fun showRecordingButton() {
        binding.walkButton.setImageResource(R.drawable.ic_stop)
        binding.walkButton.backgroundTintList = ContextCompat.getColorStateList(this, R.color.walk_stop)
        binding.walkButton.contentDescription = getString(R.string.stop_walk)
        if (recording) binding.vertexButton.visibility = View.VISIBLE
    }

    private fun hasLocationPermission(): Boolean {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) ==
            PackageManager.PERMISSION_GRANTED
    }

    private data class RefinedFix(
        val latitude: Double,
        val longitude: Double,
        val accuracyMetres: Float,
    )

    private enum class Refine {
        NONE,
        START,
        VERTEX,
    }

    companion object {
        private const val STYLE_URI = "https://tiles.openfreemap.org/styles/liberty"
        private const val TRAIL_SOURCE = "walk-trail"
        private const val TRAIL_LAYER = "walk-trail-line"
        private const val BOUNDARY_SOURCE = "lot-boundary"
        private const val BOUNDARY_LAYER = "lot-boundary-line"
        private const val FILL_SOURCE = "lot-fill"
        private const val FILL_LAYER = "lot-fill-layer"
        private const val VERTEX_SOURCE = "lot-vertices"
        private const val VERTEX_LAYER = "lot-vertices-layer"
        private const val LIMIT_SOURCE = "vertex-limit"
        private const val LIMIT_LAYER = "vertex-limit-layer"
        private const val VERTEX_ID = "vertexId"
        private const val MAX_ACCURACY_M = 15f
        private const val WALK_ZOOM = 19.0
        private const val REFINE_MS = 5_000L
    }
}
