package one.percolate.maplogger

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.credentials.exceptions.CreateCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import one.percolate.maplogger.databinding.ActivityGateBinding
import java.io.IOException
import java.security.SecureRandom

class GateActivity : AppCompatActivity() {
    private lateinit var binding: ActivityGateBinding
    private var started = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityGateBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.retryButton.setOnClickListener {
            started = false
            begin()
        }
        begin()
    }

    private fun begin() {
        if (started) return
        started = true
        val existing = AppStore(this).identity()
        binding.status.setText(if (existing == null) R.string.creating_passkey else R.string.unlocking)
        binding.retryButton.visibility = View.GONE
        lifecycleScope.launch {
            try {
                if (existing == null) createAccount() else unlock(existing)
                startActivity(Intent(this@GateActivity, MainActivity::class.java))
                finish()
            } catch (cancelled: CancellationException) {
                throw cancelled
            } catch (_: CreateCredentialCancellationException) {
                showRetry(getString(R.string.passkey_cancelled))
            } catch (_: GetCredentialCancellationException) {
                showRetry(getString(R.string.passkey_cancelled))
            } catch (error: Exception) {
                showRetry(error.message ?: getString(R.string.passkey_failed))
            }
        }
    }

    private suspend fun createAccount() {
        val api = RwaaApi()
        val challenge = withContext(Dispatchers.IO) { api.challenge() }
        val responseJson = Passkeys.create(this, challenge.nonce)
        val identity = withContext(Dispatchers.IO) { api.register(challenge.challengeId, responseJson) }
        AppStore(this).saveIdentity(identity)
    }

    private suspend fun unlock(identity: Identity) {
        val api = RwaaApi()
        try {
            val challenge = withContext(Dispatchers.IO) { api.challenge() }
            val bound = ChallengeBinding.bind(challenge.nonce, "POST", "/v1/auth/session", "")
            val assertion = Passkeys.get(this, bound, identity.credentialId, challenge.challengeId)
            withContext(Dispatchers.IO) { api.session(assertion) }
        } catch (error: IOException) {
            if (error is ApiException) throw error
            val local = ByteArray(32).also { SecureRandom().nextBytes(it) }
            Passkeys.get(this, ChallengeBinding.b64urlEncode(local), identity.credentialId, "")
        }
    }

    private fun showRetry(message: String) {
        started = false
        val fingerprint = AppCert.sha256(this)
        binding.status.text = if (fingerprint.isBlank()) {
            message
        } else {
            "$message\n\n${getString(R.string.cert_fingerprint, fingerprint)}"
        }
        binding.retryButton.visibility = View.VISIBLE
    }
}
