package one.percolate.maplogger

import android.app.Application
import org.maplibre.android.MapLibre

class MapLoggerApp : Application() {
    override fun onCreate() {
        super.onCreate()
        MapLibre.getInstance(this)
    }
}
