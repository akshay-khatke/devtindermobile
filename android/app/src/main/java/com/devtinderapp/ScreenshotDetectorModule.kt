package com.devtinderapp

import android.app.Activity
import android.os.Build
import android.database.ContentObserver
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class ScreenshotDetectorModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

    private var contentObserver: ContentObserver? = null
    
    // Using Any type to avoid class loading issues on older Android versions
    private var screenCaptureCallback: Any? = null 

    init {
        reactContext.addLifecycleEventListener(this)
    }

    override fun getName(): String {
        return "ScreenshotDetector"
    }

    @ReactMethod
    fun startListening() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) { // API 34+
            startListeningApi34()
        } else {
            startListeningLegacy()
        }
    }
    
    @RequiresApi(Build.VERSION_CODES.UPSIDE_DOWN_CAKE)
    private fun startListeningApi34() {
        val activity = reactContext.currentActivity
        if (activity != null && screenCaptureCallback == null) {
            val callback = Activity.ScreenCaptureCallback {
                sendEvent("onScreenshotDetected", "Screenshot detected by system API")
            }
            screenCaptureCallback = callback
            activity.registerScreenCaptureCallback(activity.mainExecutor, callback)
        }
    }
    
    private fun startListeningLegacy() {
        if (contentObserver != null) return

        contentObserver = object : ContentObserver(Handler(Looper.getMainLooper())) {
            override fun onChange(selfChange: Boolean, uri: Uri?) {
                super.onChange(selfChange, uri)
                try {
                    val projection = arrayOf(
                        MediaStore.Images.Media.DISPLAY_NAME,
                        MediaStore.Images.Media.DATA,
                        MediaStore.Images.Media.DATE_ADDED
                    )
                    
                    // Query the most recently added image
                    val cursor = reactContext.contentResolver.query(
                        MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                        projection,
                        null,
                        null,
                        "${MediaStore.Images.Media.DATE_ADDED} DESC LIMIT 1"
                    )
                    
                    cursor?.use {
                        if (it.moveToFirst()) {
                            var isScreenshot = false
                            
                            val nameIndex = it.getColumnIndex(MediaStore.Images.Media.DISPLAY_NAME)
                            if (nameIndex != -1) {
                                val name = it.getString(nameIndex)
                                if (name != null && name.lowercase().contains("screenshot")) {
                                    isScreenshot = true
                                }
                            }
                            
                            if (!isScreenshot) {
                                val dataIndex = it.getColumnIndex(MediaStore.Images.Media.DATA)
                                if (dataIndex != -1) {
                                    val path = it.getString(dataIndex)
                                    if (path != null && path.lowercase().contains("screenshot")) {
                                        isScreenshot = true
                                    }
                                }
                            }
                            
                            // Check if the file was added in the last 10 seconds to avoid false positives
                            val dateAddedIndex = it.getColumnIndex(MediaStore.Images.Media.DATE_ADDED)
                            if (dateAddedIndex != -1) {
                                val dateAdded = it.getLong(dateAddedIndex)
                                val currentTime = System.currentTimeMillis() / 1000
                                if (currentTime - dateAdded > 10) {
                                    isScreenshot = false // Too old, not a new screenshot
                                }
                            }

                            if (isScreenshot) {
                                sendEvent("onScreenshotDetected", "Screenshot detected via MediaStore")
                            }
                        }
                    }
                } catch (e: Exception) {
                    // SecurityException might be thrown on Android 13 without READ_MEDIA_IMAGES permission.
                    // Since a media change happened while our detector is active, we can assume it's a screenshot as a fallback.
                    sendEvent("onScreenshotDetected", "Screenshot detected (Fallback)")
                }
            }
        }

        try {
            reactContext.contentResolver.registerContentObserver(
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                true,
                contentObserver!!
            )
        } catch (e: Exception) {
            // Ignore if unable to register
        }
    }

    @ReactMethod
    fun stopListening() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            stopListeningApi34()
        } else {
            stopListeningLegacy()
        }
    }
    
    @RequiresApi(Build.VERSION_CODES.UPSIDE_DOWN_CAKE)
    private fun stopListeningApi34() {
        val activity = reactContext.currentActivity
        val callback = screenCaptureCallback as? Activity.ScreenCaptureCallback
        if (activity != null && callback != null) {
            activity.unregisterScreenCaptureCallback(callback)
            screenCaptureCallback = null
        }
    }
    
    private fun stopListeningLegacy() {
        contentObserver?.let {
            reactContext.contentResolver.unregisterContentObserver(it)
            contentObserver = null
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    private var lastAlertTime = 0L

    private fun sendEvent(eventName: String, message: String) {
        val currentTime = System.currentTimeMillis()
        if (currentTime - lastAlertTime > 2000) { // Debounce for 2 seconds
            lastAlertTime = currentTime
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, message)
        }
    }

    override fun onHostResume() {}

    override fun onHostPause() {}

    override fun onHostDestroy() {
        stopListening()
    }
}
