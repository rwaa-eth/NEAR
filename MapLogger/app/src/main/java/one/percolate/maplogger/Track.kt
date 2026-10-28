package one.percolate.maplogger

import kotlin.math.asin
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.sin
import kotlin.math.sqrt

data class LatLng(val latitude: Double, val longitude: Double)

/**
 * A corner of the lot. [recorded] is the refined GPS fix.
 * [position] may be dragged, but only within [elasticMetres] of that spot.
 */
data class OutlineVertex(
    val id: Long,
    val recorded: LatLng,
    var position: LatLng,
    val elasticMetres: Double,
)

/**
 * The red trail is a straight segment about every 5 metres.
 * Lot corners are only the vertices the walker places by hand.
 */
class Track(private val segmentMetres: Double = 5.0) {
    private val path = ArrayList<LatLng>()
    private val vertices = ArrayList<OutlineVertex>()
    private var nextId = 1L
    private var closed = false

    fun points(): List<LatLng> = path.toList()

    fun vertices(): List<OutlineVertex> = vertices.toList()

    fun isClosed(): Boolean = closed

    fun clear() {
        path.clear()
        vertices.clear()
        closed = false
    }

    /** Returns true when a trail point was stored. */
    fun addFix(latitude: Double, longitude: Double): Boolean {
        val next = LatLng(latitude, longitude)
        val previous = path.lastOrNull()
        if (previous != null && haversineMetres(previous, next) < segmentMetres) {
            return false
        }
        path.add(next)
        return true
    }

    /** Drops a vertex. False when one is already nearby. */
    fun addVertex(latitude: Double, longitude: Double, accuracyMetres: Float): Boolean {
        val point = LatLng(latitude, longitude)
        if (nearestVertexMetres(point) < VERTEX_GAP_METRES) return false
        vertices.add(
            OutlineVertex(
                id = nextId++,
                recorded = point,
                position = point,
                elasticMetres = elasticMetres(accuracyMetres),
            ),
        )
        return true
    }

    /** Closes the lot when there are at least three corners. */
    fun close(): Boolean {
        if (vertices.size < 3) return false
        closed = true
        return true
    }

    /**
     * Moves a vertex toward the finger. Past the elastic radius the point
     * stretches only part of the way, so the drag tightens instead of letting go.
     */
    fun dragVertex(id: Long, latitude: Double, longitude: Double): OutlineVertex? {
        val vertex = vertices.find { it.id == id } ?: return null
        vertex.position = constrained(vertex, LatLng(latitude, longitude), stretch = STRETCH)
        return vertex
    }

    /** Lets the vertex settle back onto the elastic radius. */
    fun releaseVertex(id: Long): OutlineVertex? {
        val vertex = vertices.find { it.id == id } ?: return null
        vertex.position = constrained(vertex, vertex.position, stretch = 0.0)
        return vertex
    }

    private fun nearestVertexMetres(point: LatLng): Double {
        return vertices.minOfOrNull { vertex ->
            min(haversineMetres(vertex.recorded, point), haversineMetres(vertex.position, point))
        } ?: Double.POSITIVE_INFINITY
    }

    private fun constrained(vertex: OutlineVertex, target: LatLng, stretch: Double): LatLng {
        val distance = haversineMetres(vertex.recorded, target)
        if (distance <= vertex.elasticMetres || distance < 0.05) return target
        val overflow = distance - vertex.elasticMetres
        val allowed = vertex.elasticMetres + overflow * stretch
        return interpolate(vertex.recorded, target, allowed / distance)
    }

    companion object {
        private const val VERTEX_GAP_METRES = 4.0
        private const val STRETCH = 0.18

        fun elasticMetres(accuracyMetres: Float): Double {
            return (accuracyMetres.toDouble() * 2.0).coerceIn(12.0, 25.0)
        }

        fun haversineMetres(a: LatLng, b: LatLng): Double {
            val radius = 6_371_000.0
            val p1 = Math.toRadians(a.latitude)
            val p2 = Math.toRadians(b.latitude)
            val dp = Math.toRadians(b.latitude - a.latitude)
            val dl = Math.toRadians(b.longitude - a.longitude)
            val h = sin(dp / 2) * sin(dp / 2) + cos(p1) * cos(p2) * sin(dl / 2) * sin(dl / 2)
            return 2 * radius * asin(min(1.0, sqrt(h)))
        }

        fun destination(from: LatLng, metres: Double, bearingDegrees: Double): LatLng {
            val radius = 6_371_000.0
            val angular = metres / radius
            val bearing = Math.toRadians(bearingDegrees)
            val lat1 = Math.toRadians(from.latitude)
            val lon1 = Math.toRadians(from.longitude)
            val lat2 = asin(sin(lat1) * cos(angular) + cos(lat1) * sin(angular) * cos(bearing))
            val lon2 = lon1 + atan2(
                sin(bearing) * sin(angular) * cos(lat1),
                cos(angular) - sin(lat1) * sin(lat2),
            )
            return LatLng(Math.toDegrees(lat2), Math.toDegrees(lon2))
        }

        private fun interpolate(from: LatLng, to: LatLng, fraction: Double): LatLng {
            return LatLng(
                from.latitude + (to.latitude - from.latitude) * fraction,
                from.longitude + (to.longitude - from.longitude) * fraction,
            )
        }
    }
}
