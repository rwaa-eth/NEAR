package one.percolate.maplogger

import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale

class ApiException(message: String) : IOException(message)

data class IssuedChallenge(val challengeId: String, val nonce: String)

data class PasskeyAssertion(
    val challengeId: String,
    val credentialId: String,
    val clientDataJSON: String,
    val authenticatorData: String,
    val signature: String,
    val userHandle: String?,
)

data class SavedParcel(
    val id: String,
    val accountId: String,
    val ringJson: String,
    val geometryRev: String,
)

class RwaaApi(
    private val base: String = BuildConfig.API_BASE.trimEnd('/'),
    private val token: String = BuildConfig.API_TOKEN,
) {
    fun challenge(): IssuedChallenge {
        val json = request("POST", "/v1/auth/challenge", "", emptyMap())
        return IssuedChallenge(json.getString("challengeId"), json.getString("nonce"))
    }

    fun register(challengeId: String, registrationResponseJson: String): Identity {
        val body = JSONObject()
            .put("challengeId", challengeId)
            .put("credential", JSONObject(registrationResponseJson))
            .toString()
        val json = request("POST", "/v1/auth/register", body, emptyMap())
        return Identity(
            credentialId = json.getString("credentialId"),
            accountId = json.getString("accountId"),
            publicKey = json.getString("publicKey"),
        )
    }

    fun session(assertion: PasskeyAssertion) {
        request("POST", "/v1/auth/session", "", assertion.headers())
    }

    fun saveParcel(body: String, assertion: PasskeyAssertion): SavedParcel {
        val json = request("POST", "/v1/parcels", body, assertion.headers())
        val ring = json.getJSONArray("ring")
        return SavedParcel(
            id = json.getString("id"),
            accountId = json.getString("accountId"),
            ringJson = ring.toString(),
            geometryRev = json.getString("geometryRev"),
        )
    }

    private fun request(method: String, path: String, body: String, extra: Map<String, String>): JSONObject {
        val connection = (URL(base + path).openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 20_000
            readTimeout = 30_000
            setRequestProperty("Authorization", "Bearer $token")
            setRequestProperty("Accept", "application/json")
            for ((name, value) in extra) setRequestProperty(name, value)
            if (body.isNotEmpty()) {
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
            }
        }
        try {
            if (body.isNotEmpty()) {
                connection.outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) }
            }
            val stream = if (connection.responseCode in 200..299) connection.inputStream else connection.errorStream
            val text = stream?.bufferedReader()?.use { it.readText() }.orEmpty()
            if (connection.responseCode !in 200..299) {
                val message = runCatching { JSONObject(text).optString("error") }.getOrDefault("").ifBlank { text }
                throw ApiException(message.ifBlank { "Request failed (${connection.responseCode})" })
            }
            if (text.isBlank()) return JSONObject()
            return JSONObject(text)
        } finally {
            connection.disconnect()
        }
    }
}

fun PasskeyAssertion.headers(): Map<String, String> {
    val headers = linkedMapOf(
        "X-Challenge-Id" to challengeId,
        "X-Credential-Id" to credentialId,
        "X-Client-Data" to clientDataJSON,
        "X-Authenticator-Data" to authenticatorData,
        "X-Signature" to signature,
    )
    if (!userHandle.isNullOrEmpty()) headers["X-User-Handle"] = userHandle
    return headers
}

object LotPayload {
    /** Closed ring as `[longitude, latitude]`, the shape `POST /v1/parcels` stores. */
    fun ringBody(corners: List<LatLng>): String {
        val points = if (corners.size >= 2 && same(corners.first(), corners.last())) corners else corners + corners.first()
        val array = JSONArray()
        for (point in points) {
            array.put(JSONArray().put(number(point.longitude)).put(number(point.latitude)))
        }
        return JSONObject().put("ring", array).toString()
    }

    private fun same(a: LatLng, b: LatLng): Boolean = a.latitude == b.latitude && a.longitude == b.longitude

    private fun number(value: Double): Double {
        return String.format(Locale.US, "%.8f", value).trimEnd('0').trimEnd('.').toDouble()
    }
}
