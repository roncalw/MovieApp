package com.codefest.movieapp

import android.view.View
import android.view.ViewGroup
import android.view.Window
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.views.modal.ReactModalHostView

/**
 * Temporarily hides Android system bars while the trailer modal is open.
 *
 * A React Native Modal owns a separate Android window, so changing only the
 * Activity window leaves the bars visible over the trailer. Both windows must
 * request immersive mode, and both are restored when the trailer closes.
 */
class TrailerFullscreenModule(
  reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "TrailerFullscreen"

  @ReactMethod
  fun setEnabled(enabled: Boolean) {
    val activity = reactApplicationContext.currentActivity ?: return

    activity.runOnUiThread {
      val windows = linkedSetOf(activity.window)
      collectModalWindows(activity.window.decorView, windows)

      windows.forEach { window ->
        val controller = WindowCompat.getInsetsController(window, window.decorView)

        if (enabled) {
          controller.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
          controller.hide(WindowInsetsCompat.Type.systemBars())
        } else {
          controller.show(WindowInsetsCompat.Type.systemBars())
        }
      }
    }
  }

  private fun collectModalWindows(view: View, windows: MutableSet<Window>) {
    if (view is ReactModalHostView) {
      view.dialog?.window?.let(windows::add)
    }

    if (view is ViewGroup) {
      for (index in 0 until view.childCount) {
        collectModalWindows(view.getChildAt(index), windows)
      }
    }
  }
}
