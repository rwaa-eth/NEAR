package one.percolate.maplogger

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import one.percolate.maplogger.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.mapOption.setOnClickListener {
            startActivity(Intent(this, MapActivity::class.java))
        }
    }
}
