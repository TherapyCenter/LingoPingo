package de.lingopingo.app;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.SslErrorHandler;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/**
 * LingoPingo as an Android app: the web app is bundled in assets/public and served
 * from a virtual https origin. Speech output and recognition use the native Android
 * services, because Android's WebView does not implement the Web Speech API.
 */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START_URL = "https://" + HOST + "/index.html";
    private static final int REQ_MIC = 1;

    private WebView web;
    private TextToSpeech tts;
    private final CountDownLatch ttsInit = new CountDownLatch(1);
    private volatile boolean ttsReady = false;
    private SpeechRecognizer recognizer;
    private final Handler ui = new Handler(Looper.getMainLooper());
    private String pendingTag, pendingId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        boolean dark = (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK)
                == Configuration.UI_MODE_NIGHT_YES;
        int bg = dark ? 0xFF131F24 : 0xFFFFFFFF;

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(bg);
        web = new WebView(this);
        web.setBackgroundColor(bg);
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);

        // Android 15 draws edge-to-edge: keep the content clear of system bars and keyboard
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            int l, t, r, b;
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(
                        WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                android.graphics.Insets ime = insets.getInsets(WindowInsets.Type.ime());
                l = bars.left; t = bars.top; r = bars.right; b = Math.max(bars.bottom, ime.bottom);
            } else {
                l = insets.getSystemWindowInsetLeft(); t = insets.getSystemWindowInsetTop();
                r = insets.getSystemWindowInsetRight(); b = insets.getSystemWindowInsetBottom();
            }
            v.setPadding(l, t, r, b);
            return insets;
        });

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        // optional sync with a LingoPingo server in the home network (often plain http)
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        web.setWebViewClient(new Client());
        web.addJavascriptInterface(new Bridge(), "LingoAndroid");

        tts = new TextToSpeech(this, status -> {
            ttsReady = status == TextToSpeech.SUCCESS;
            ttsInit.countDown();
        });
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override public void onStart(String id) { }
            @Override public void onDone(String id) { callback(id, "done", null); }
            @Override public void onError(String id) { callback(id, "done", null); }
            @Override public void onStop(String id, boolean interrupted) { callback(id, "done", null); }
        });

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl(START_URL);
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("window.__lpBack ? window.__lpBack() : false", handled -> {
            if (!"true".equals(handled)) moveTaskToBack(true);
        });
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (tts != null) tts.stop();
    }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        if (recognizer != null) recognizer.destroy();
        web.destroy();
        super.onDestroy();
    }

    /** Sends an async result back to audio.js (window.__lpBridge). */
    private void callback(String id, String kind, String data) {
        if (id == null) return;
        String js = "window.__lpBridge && window.__lpBridge(" + JSONObject.quote(id) + "," + JSONObject.quote(kind)
                + "," + (data == null ? "null" : JSONObject.quote(data)) + ")";
        ui.post(() -> web.evaluateJavascript(js, null));
    }

    private boolean awaitTts() {
        try { ttsInit.await(3, TimeUnit.SECONDS); } catch (InterruptedException ignored) { }
        return ttsReady;
    }

    // ---------- JavaScript bridge (window.LingoAndroid) ----------
    private class Bridge {
        @JavascriptInterface
        public boolean hasLang(String tag) {
            if (!awaitTts()) return false;
            return tts.isLanguageAvailable(Locale.forLanguageTag(tag)) >= TextToSpeech.LANG_AVAILABLE;
        }

        @JavascriptInterface
        public void speak(String text, String tag, float rate, String id) {
            if (!awaitTts()) { callback(id, "done", null); return; }
            tts.setLanguage(Locale.forLanguageTag(tag));
            tts.setSpeechRate(rate);
            Bundle params = new Bundle();
            if (tts.speak(text, TextToSpeech.QUEUE_FLUSH, params, id) != TextToSpeech.SUCCESS) callback(id, "done", null);
        }

        @JavascriptInterface
        public void stop() {
            if (ttsReady) tts.stop();
        }

        @JavascriptInterface
        public boolean sttAvailable() {
            return SpeechRecognizer.isRecognitionAvailable(MainActivity.this);
        }

        @JavascriptInterface
        public void listen(String tag, String id) {
            ui.post(() -> startListening(tag, id));
        }

        @JavascriptInterface
        public void stopListening() {
            ui.post(() -> { if (recognizer != null) recognizer.stopListening(); });
        }
    }

    // ---------- Speech recognition ----------
    private void startListening(String tag, String id) {
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            pendingTag = tag; pendingId = id;
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_MIC);
            return;
        }
        if (tts != null) tts.stop();
        if (recognizer == null) recognizer = SpeechRecognizer.createSpeechRecognizer(this);
        recognizer.cancel();
        recognizer.setRecognitionListener(new RecognitionListener() {
            boolean done = false;
            private void finish(String kind, String data) { if (!done) { done = true; callback(id, kind, data); } }
            @Override public void onResults(Bundle results) {
                ArrayList<String> list = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                finish("result", new JSONArray(list == null ? new ArrayList<String>() : list).toString());
            }
            @Override public void onError(int error) {
                if (error == SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS) finish("error", "not-allowed");
                else if (error == SpeechRecognizer.ERROR_NO_MATCH || error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT) finish("result", "[]");
                else finish("error", "error-" + error);
            }
            @Override public void onReadyForSpeech(Bundle params) { }
            @Override public void onBeginningOfSpeech() { }
            @Override public void onRmsChanged(float rmsdB) { }
            @Override public void onBufferReceived(byte[] buffer) { }
            @Override public void onEndOfSpeech() { }
            @Override public void onPartialResults(Bundle partialResults) { }
            @Override public void onEvent(int eventType, Bundle params) { }
        });
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, tag);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, tag);
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5);
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false);
        recognizer.startListening(intent);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {
        if (requestCode != REQ_MIC || pendingId == null) return;
        String tag = pendingTag, id = pendingId;
        pendingTag = null; pendingId = null;
        if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) startListening(tag, id);
        else callback(id, "error", "not-allowed");
    }

    // ---------- Serving the bundled web app ----------
    private class Client extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
            Uri u = req.getUrl();
            if (!HOST.equals(u.getHost())) return null;
            String path = u.getPath();
            if (path == null || path.equals("/")) path = "/index.html";
            if (path.startsWith("/api/") || path.contains("..")) return notFound();
            try {
                return asset(path);
            } catch (IOException e) {
                // SPA fallback for paths without a file extension
                if (!path.substring(path.lastIndexOf('/') + 1).contains(".")) {
                    try { return asset("/index.html"); } catch (IOException ignored) { }
                }
                return notFound();
            }
        }

        private WebResourceResponse asset(String path) throws IOException {
            InputStream in = getAssets().open("public" + path);
            Map<String, String> headers = new HashMap<>();
            headers.put("Cache-Control", "no-cache");
            return new WebResourceResponse(mime(path), "utf-8", 200, "OK", headers, in);
        }

        private WebResourceResponse notFound() {
            return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", new HashMap<>(),
                    new ByteArrayInputStream(new byte[0]));
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
            Uri u = req.getUrl();
            if (HOST.equals(u.getHost())) return false;
            try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
            return true;
        }

        @Override
        public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
            // Self-signed certificates are accepted only for servers in the private home network
            String host = Uri.parse(error.getUrl()).getHost();
            if (host != null && isPrivateHost(host)) handler.proceed();
            else handler.cancel();
        }
    }

    private static boolean isPrivateHost(String h) {
        if (h.equals("localhost") || h.endsWith(".local") || h.endsWith(".fritz.box")) return true;
        if (h.startsWith("10.") || h.startsWith("192.168.")) return true;
        if (h.startsWith("172.")) {
            String[] p = h.split("\\.");
            try { int n = Integer.parseInt(p[1]); return n >= 16 && n <= 31; } catch (Exception e) { return false; }
        }
        return false;
    }

    private static String mime(String path) {
        String p = path.toLowerCase(Locale.ROOT);
        if (p.endsWith(".html")) return "text/html";
        if (p.endsWith(".js") || p.endsWith(".mjs")) return "text/javascript";
        if (p.endsWith(".css")) return "text/css";
        if (p.endsWith(".json")) return "application/json";
        if (p.endsWith(".webmanifest")) return "application/manifest+json";
        if (p.endsWith(".svg")) return "image/svg+xml";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".ico")) return "image/x-icon";
        return "application/octet-stream";
    }
}
