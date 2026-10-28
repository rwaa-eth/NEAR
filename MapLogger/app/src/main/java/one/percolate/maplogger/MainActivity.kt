package one.percolate.maplogger

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import one.percolate.maplogger.databinding.ActivityMainBinding
import org.json.JSONArray

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.mapOption.setOnClickListener {
            startActivity(Intent(this, MapActivity::class.java))
        }
        binding.copyButton.setOnClickListener {
            val account = binding.accountId.text?.toString().orEmpty()
            if (account.isBlank()) return@setOnClickListener
            val clipboard = getSystemService(ClipboardManager::class.java)
            clipboard.setPrimaryClip(ClipData.newPlainText("NEAR account", account))
            Toast.makeText(this, R.string.account_copied, Toast.LENGTH_SHORT).show()
        }
        binding.explorerButton.setOnClickListener {
            val account = binding.accountId.text?.toString().orEmpty()
            if (account.isBlank()) return@setOnClickListener
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(NearAccount.explorerUrl(account))))
        }
    }

    override fun onResume() {
        super.onResume()
        val identity = AppStore(this).identity()
        if (identity == null) {
            startActivity(Intent(this, GateActivity::class.java))
            finish()
            return
        }
        binding.accountId.text = identity.accountId
        binding.qr.setImageBitmap(NearAccount.qr(identity.accountId))
        val lot = AppStore(this).lot()
        binding.lotStatus.text = if (lot == null) {
            getString(R.string.no_lot)
        } else {
            val corners = runCatching { JSONArray(lot.ringJson).length().let { if (it > 1) it - 1 else it } }.getOrDefault(0)
            getString(R.string.lot_saved, corners)
        }
        binding.balance.setText(R.string.balance_loading)
        lifecycleScope.launch {
            val label = withContext(Dispatchers.IO) { NearAccount.balanceLabel(identity.accountId) }
            binding.balance.text = label
        }
    }
}
