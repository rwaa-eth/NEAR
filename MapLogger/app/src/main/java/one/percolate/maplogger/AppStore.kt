package one.percolate.maplogger

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

data class Identity(
    val credentialId: String,
    val accountId: String,
    val publicKey: String,
)

data class StoredLot(
    val ringJson: String,
    val serverId: String,
    val registeredAt: String,
)

/** Passkey account and the one lot registered for it. Both stay on the device. */
class AppStore(context: Context) {
    private val db = helper(context).writableDatabase

    fun identity(): Identity? {
        db.rawQuery("SELECT credential_id, account_id, public_key FROM identity WHERE id = 1", null).use { cursor ->
            if (!cursor.moveToFirst()) return null
            return Identity(cursor.getString(0), cursor.getString(1), cursor.getString(2))
        }
    }

    fun saveIdentity(identity: Identity) {
        db.execSQL(
            "INSERT OR REPLACE INTO identity (id, credential_id, account_id, public_key) VALUES (1, ?, ?, ?)",
            arrayOf(identity.credentialId, identity.accountId, identity.publicKey),
        )
    }

    fun lot(): StoredLot? {
        db.rawQuery("SELECT ring_json, server_id, registered_at FROM lot WHERE id = 1", null).use { cursor ->
            if (!cursor.moveToFirst()) return null
            return StoredLot(cursor.getString(0), cursor.getString(1), cursor.getString(2))
        }
    }

    fun saveLot(ringJson: String, serverId: String, registeredAt: String) {
        db.execSQL(
            "INSERT OR REPLACE INTO lot (id, ring_json, server_id, registered_at) VALUES (1, ?, ?, ?)",
            arrayOf(ringJson, serverId, registeredAt),
        )
    }

    private class Helper(context: Context) : SQLiteOpenHelper(context, "maplogger.sqlite", null, 1) {
        override fun onCreate(db: SQLiteDatabase) {
            db.execSQL(
                """
                CREATE TABLE identity (
                  id INTEGER PRIMARY KEY CHECK (id = 1),
                  credential_id TEXT NOT NULL,
                  account_id TEXT NOT NULL,
                  public_key TEXT NOT NULL
                )
                """.trimIndent(),
            )
            db.execSQL(
                """
                CREATE TABLE lot (
                  id INTEGER PRIMARY KEY CHECK (id = 1),
                  ring_json TEXT NOT NULL,
                  server_id TEXT NOT NULL,
                  registered_at TEXT NOT NULL
                )
                """.trimIndent(),
            )
        }

        override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) = Unit
    }

    companion object {
        @Volatile private var open: Helper? = null

        private fun helper(context: Context): Helper {
            return open ?: synchronized(this) {
                open ?: Helper(context.applicationContext).also { open = it }
            }
        }
    }
}
