package com.movieapp.network

import android.content.Context
import android.util.Log
import com.facebook.react.modules.network.OkHttpClientProvider
import java.util.Locale
import okhttp3.OkHttpClient

/*
 * Android direct external API request identity layer.
 *
 * Some external API sources can treat React Native Android's generic OkHttp
 * request identity differently than iOS or browser requests, even when the URL is
 * identical. Logcat showed that pattern for the Home page's direct TMDB calls.
 *
 * Keep this fix isolated in a dedicated app source file instead of patching node_modules:
 * - It applies only to hosts we explicitly allowlist after proving this failure.
 * - It is easy to find during Android or React Native upgrades.
 * - It avoids changing React Native's generic networking behavior for every API.
 *
 * Important: do not set Accept-Encoding here.
 *
 * In many HTTP examples, setting Accept-Encoding is normal because the app is
 * deliberately asking the server for gzip, Brotli, or plain identity responses.
 * React Native Android is different because it sends requests through OkHttp.
 * When this app leaves Accept-Encoding absent, OkHttp owns the compression path:
 * it can ask for gzip and transparently return decoded JSON to React Native.
 *
 * If this app sets Accept-Encoding itself, OkHttp no longer uses that automatic
 * gzip path. That does not mean every value requires decompression: for example,
 * "identity" asks the server for an uncompressed response. It means the app has
 * taken responsibility for the content-encoding contract. If the server or a CDN
 * still returns a compressed response, OkHttp will not transparently fix that for
 * us, so React Native can receive bytes it cannot parse as JSON.
 *
 * We intentionally do not force "identity" because that would make every TMDB
 * response larger and would still depend on the server/CDN honoring the request.
 * The safer default is to let OkHttp ask for what it knows how to decode.
 *
 * Maintenance check:
 * After changing this file, run the VS Code task named:
 *   ANDROID - Compile Kotlin Debug
 *
 * That task is defined in `.vscode/tasks.json` and runs Gradle's
 * `:app:compileDebugKotlin` target. Gradle is the source of truth for this file
 * because it loads the real Android/React Native/Kotlin classpath. The VS Code
 * Kotlin extension is helpful while editing, but this compiler task is the
 * reliable check that catches native Kotlin classpath and syntax problems.
 */
object ExternalApiIdentityOkHttpConfigurator {
    private const val TAG = "MovieAppExternalApi"
    private const val ANDROID_BROWSER_USER_AGENT =
        "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36"

  private val EXTERNAL_API_IDENTITY_HOSTS =
    setOf(
      "api.themoviedb.org",
      "api.tmdb.org",
    )

  fun install(context: Context) {
    val appContext = context.applicationContext

    OkHttpClientProvider.setOkHttpClientFactory {
      createExternalApiAwareClient(appContext)
    }

    Log.d(TAG, "Installed external API identity OkHttp configurator")
  }

  private fun createExternalApiAwareClient(context: Context): OkHttpClient =
    OkHttpClientProvider
      .createClientBuilder(context)
      .addInterceptor { chain ->
        val originalRequest = chain.request()
        val host = originalRequest.url.host.lowercase(Locale.US)

        if (!EXTERNAL_API_IDENTITY_HOSTS.contains(host)) {
          return@addInterceptor chain.proceed(originalRequest)
        }

        val normalizedRequest =
          originalRequest
            .newBuilder()
            .header("Accept", "application/json")
            .header("User-Agent", ANDROID_BROWSER_USER_AGENT)
            .removeHeader("Content-Type")
            .build()

        Log.d(
          TAG,
          "External API request ${normalizedRequest.method}: ${
            redactKnownSecrets(normalizedRequest.url.toString())
          }"
        )

        chain.proceed(normalizedRequest)
      }
      .build()

  private fun redactKnownSecrets(url: String): String =
    url.replace(Regex("(api_key=)[^&]+"), "$1REDACTED")
}
