package one.percolate.maplogger

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.credentials.CreatePublicKeyCredentialRequest
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetPublicKeyCredentialOption
import androidx.credentials.PublicKeyCredential
import androidx.credentials.CreatePublicKeyCredentialResponse
import org.json.JSONObject
import java.security.MessageDigest
import java.security.SecureRandom

object Passkeys {
    private val random = SecureRandom()

    suspend fun create(context: Context, challengeNonce: String): String {
        val userId = ByteArray(32).also { random.nextBytes(it) }
        val requestJson = """
            {
              "challenge": "$challengeNonce",
              "rp": { "name": "RWAA", "id": "${BuildConfig.RP_ID}" },
              "user": {
                "id": "${ChallengeBinding.b64urlEncode(userId)}",
                "name": "rwaa",
                "displayName": "RWAA"
              },
              "pubKeyCredParams": [{ "type": "public-key", "alg": -7 }],
              "timeout": 60000,
              "attestation": "none",
              "authenticatorSelection": {
                "authenticatorAttachment": "platform",
                "residentKey": "required",
                "userVerification": "required"
              }
            }
        """.trimIndent()
        val result = CredentialManager.create(context).createCredential(
            context,
            CreatePublicKeyCredentialRequest(requestJson),
        )
        return (result as CreatePublicKeyCredentialResponse).registrationResponseJson
    }

    suspend fun get(context: Context, challenge: String, credentialId: String, challengeId: String): PasskeyAssertion {
        val requestJson = """
            {
              "challenge": "$challenge",
              "timeout": 60000,
              "userVerification": "required",
              "rpId": "${BuildConfig.RP_ID}",
              "allowCredentials": [{ "type": "public-key", "id": "$credentialId" }]
            }
        """.trimIndent()
        val result = CredentialManager.create(context).getCredential(
            context,
            GetCredentialRequest.Builder()
                .addCredentialOption(GetPublicKeyCredentialOption(requestJson))
                .build(),
        )
        val json = JSONObject((result.credential as PublicKeyCredential).authenticationResponseJson)
        val response = json.getJSONObject("response")
        return PasskeyAssertion(
            challengeId = challengeId,
            credentialId = json.getString("id"),
            clientDataJSON = response.getString("clientDataJSON"),
            authenticatorData = response.getString("authenticatorData"),
            signature = response.getString("signature"),
            userHandle = response.optString("userHandle").ifBlank { null },
        )
    }
}

object AppCert {
    fun sha256(context: Context): String {
        val signatures = if (Build.VERSION.SDK_INT >= 28) {
            val info = context.packageManager.getPackageInfo(
                context.packageName,
                PackageManager.GET_SIGNING_CERTIFICATES,
            )
            info.signingInfo?.apkContentsSigners ?: emptyArray()
        } else {
            @Suppress("DEPRECATION")
            val info = context.packageManager.getPackageInfo(context.packageName, PackageManager.GET_SIGNATURES)
            @Suppress("DEPRECATION")
            info.signatures ?: emptyArray()
        }
        val encoded = signatures.firstOrNull()?.toByteArray() ?: return ""
        val digest = MessageDigest.getInstance("SHA-256").digest(encoded)
        return digest.joinToString(":") { "%02X".format(it) }
    }
}
