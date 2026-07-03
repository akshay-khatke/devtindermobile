package com.devtinderapp

import android.app.Activity
import android.app.Application
import android.database.ContentObserver
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class ScreenshotDetectorModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), Application.ActivityLifecycleCallbacks {

    private val reactContext: ReactApplicationContext = reactContext
    private var isListening = false
    private var currentActivity: Activity? = null

    @RequiresApi(api = Build.VERSION_CODES.UPSIDE_DOWN_CAKE)
    private var screenCaptureCallback: Activity.ScreenCaptureCallback? = null

    private var contentObserver: ContentObserver? = null

    override fun getName(): String {
        return "ScreenshotDetector"
    }

    init {
        val application = reactContext.applicationContext as Application
        application.registerActivityLifecycleCallbacks(this)
    }

    @ReactMethod
    fun startListening(promise: Promise) {
        if (isListening) {
            promise.resolve(true)
            return
        }

        isListening = true
        registerDetector()
        promise.resolve(true)
    }

    @ReactMethod
    fun stopListening(promise: Promise) {
        if (!isListening) {
            promise.resolve(true)
            return
        }

        isListening = false
        unregisterDetector()
        promise.resolve(true)
    }

    // React Native's NativeEventEmitter expects these two methods to exist.
    @ReactMethod
    fun addListener(eventName: String) {
        // Required for NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for NativeEventEmitter
    }

    private fun registerDetector() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) { // Android 14+
            currentActivity?.let { activity ->
                screenCaptureCallback = Activity.ScreenCaptureCallback {
                    emitScreenshotEvent()
                }
                activity.registerScreenCaptureCallback(activity.mainExecutor, screenCaptureCallback!!)
            }
        } else {
            // Android 13 and below fallback using ContentObserver
            contentObserver = object : ContentObserver(Handler(Looper.getMainLooper())) {
                override fun onChange(selfChange: Boolean, uri: Uri?) {
                    super.onChange(selfChange, uri)
                    if (uri != null && uri.toString().contains("media/external/images/media")) {
                        // Check if the change is a screenshot. 
                        // In a real app we'd query MediaStore to check the file path, 
                        // but without READ_EXTERNAL_STORAGE permission, we just assume it's a screenshot 
                        // or notify unconditionally for this simple fallback.
                        // To be safer without storage permissions, any new image might trigger this.
                        emitScreenshotEvent()
                    }
                }
            }
            reactContext.contentResolver.registerContentObserver(
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                true,
                contentObserver!!
            )
        }
    }

    private fun unregisterDetector() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            currentActivity?.let { activity ->
                screenCaptureCallback?.let { callback ->
                    activity.unregisterScreenCaptureCallback(callback)
                }
            }
            screenCaptureCallback = null
        } else {
            contentObserver?.let { observer ->
                reactContext.contentResolver.unregisterContentObserver(observer)
            }
            contentObserver = null
        }
    }

    private fun emitScreenshotEvent() {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("onScreenshotDetected", null)
    }

    // ActivityLifecycleCallbacks
    override fun onActivityResumed(activity: Activity) {
        currentActivity = activity
        if (isListening && Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            registerDetector()
        }
    }

    override fun onActivityPaused(activity: Activity) {
        if (isListening && Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            unregisterDetector()
        }
        if (currentActivity == activity) {
            currentActivity = null
        }
    }

    override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {}
    override fun onActivityStarted(activity: Activity) {}
    override fun onActivityStopped(activity: Activity) {}
    override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}
    override fun onActivityDestroyed(activity: Activity) {}
}
