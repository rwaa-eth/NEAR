import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "one.percolate.maplogger"
    compileSdk = 35

    defaultConfig {
        applicationId = "one.percolate.maplogger"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "0.1"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        viewBinding = true
        buildConfig = true
    }
}

val localProperties = Properties().apply {
    val file = rootProject.file("local.properties")
    if (file.exists()) file.inputStream().use { load(it) }
}

fun setting(key: String, fallback: String): String {
    val value = localProperties.getProperty(key) ?: fallback
    return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\""
}

android.defaultConfig.apply {
    buildConfigField("String", "API_BASE", setting("api.base", "https://rwaa.percolate.one"))
    buildConfigField("String", "API_TOKEN", setting("api.token", "dev-token-change-me"))
    buildConfigField("String", "NEAR_RPC", setting("near.rpc", "https://rpc.testnet.near.org"))
    buildConfigField("String", "RP_ID", "\"rwaa.percolate.one\"")
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.2.0")
    implementation("org.maplibre.gl:android-sdk:13.7.1")
    implementation("com.google.android.gms:play-services-location:21.3.0")
    implementation("androidx.credentials:credentials:1.3.0")
    implementation("androidx.credentials:credentials-play-services-auth:1.3.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("com.google.zxing:core:3.5.3")
}
