package one.percolate.maplogger

import android.util.Base64
import java.security.MessageDigest

/** Same binding the server uses: SHA-256(nonce || method || path || SHA-256(body)). */
object ChallengeBinding {
    fun bind(nonceB64: String, method: String, path: String, body: String): String {
        val nonce = b64urlDecode(nonceB64)
        val bodyHash = sha256(body.toByteArray(Charsets.UTF_8))
        val methodBytes = method.toByteArray(Charsets.UTF_8)
        val pathBytes = path.toByteArray(Charsets.UTF_8)
        val total = ByteArray(nonce.size + methodBytes.size + pathBytes.size + bodyHash.size)
        var offset = 0
        nonce.copyInto(total, offset)
        offset += nonce.size
        methodBytes.copyInto(total, offset)
        offset += methodBytes.size
        pathBytes.copyInto(total, offset)
        offset += pathBytes.size
        bodyHash.copyInto(total, offset)
        return b64urlEncode(sha256(total))
    }

    fun b64urlEncode(bytes: ByteArray): String {
        return Base64.encodeToString(bytes, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)
    }

    fun b64urlDecode(value: String): ByteArray {
        val padded = value + "=".repeat((4 - value.length % 4) % 4)
        return Base64.decode(padded, Base64.URL_SAFE or Base64.NO_WRAP)
    }

    private fun sha256(bytes: ByteArray): ByteArray {
        return MessageDigest.getInstance("SHA-256").digest(bytes)
    }
}
