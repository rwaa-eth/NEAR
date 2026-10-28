package one.percolate.maplogger

import android.graphics.Bitmap
import android.graphics.Color
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter
import org.json.JSONObject
import java.math.BigInteger
import java.net.HttpURLConnection
import java.net.URL

/**
 * Reads the passkey account from NEAR JSON-RPC.
 * The Kotlin wallet SDKs sign with a separate ed25519 key, so they cannot
 * act as this passkey account. `view_account` is the call those libraries make.
 */
object NearAccount {
    fun balanceLabel(accountId: String): String {
        val body = JSONObject()
            .put("jsonrpc", "2.0")
            .put("id", "balance")
            .put("method", "query")
            .put(
                "params",
                JSONObject()
                    .put("request_type", "view_account")
                    .put("finality", "final")
                    .put("account_id", accountId),
            )
            .toString()
        val connection = (URL(BuildConfig.NEAR_RPC).openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 20_000
            readTimeout = 20_000
            doOutput = true
            setRequestProperty("Content-Type", "application/json")
        }
        try {
            connection.outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) }
            val text = (if (connection.responseCode in 200..299) connection.inputStream else connection.errorStream)
                ?.bufferedReader()
                ?.use { it.readText() }
                .orEmpty()
            val json = JSONObject(text)
            if (json.has("error")) {
                val data = json.getJSONObject("error").optString("data") + json.getJSONObject("error").optString("message")
                return if (data.contains("does not exist", ignoreCase = true) || data.contains("UNKNOWN_ACCOUNT")) {
                    "Not on testnet yet"
                } else {
                    "Balance unavailable"
                }
            }
            val yocto = json.getJSONObject("result").getString("amount")
            return formatNear(yocto) + " NEAR"
        } catch (_: Exception) {
            return "Balance unavailable"
        } finally {
            connection.disconnect()
        }
    }

    fun explorerUrl(accountId: String): String {
        val host = if (BuildConfig.NEAR_RPC.contains("mainnet")) {
            "https://nearblocks.io"
        } else {
            "https://testnet.nearblocks.io"
        }
        return "$host/address/$accountId"
    }

    fun qr(accountId: String, size: Int = 512): Bitmap {
        val matrix = QRCodeWriter().encode(accountId, BarcodeFormat.QR_CODE, size, size)
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        for (x in 0 until size) {
            for (y in 0 until size) {
                bitmap.setPixel(x, y, if (matrix.get(x, y)) Color.BLACK else Color.WHITE)
            }
        }
        return bitmap
    }

    private fun formatNear(yocto: String): String {
        val value = BigInteger(yocto)
        val scale = BigInteger.TEN.pow(24)
        val whole = value.divide(scale)
        val fraction = value.remainder(scale).toString().padStart(24, '0').take(4)
        return "$whole.$fraction"
    }
}
