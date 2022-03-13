setImmediate(function () {
    Java.perform(function () {
        console.log("Performing")

        Java.scheduleOnMainThread(function () {
            var cbInterface = Java.use('com.example.gita.gxty.utils.a0$b');
            cbInterface.onResult.implementation = function () {
                console.log("Args0: " + arguments[0]);
                console.log("Args1: " + arguments[1]);
                console.log("Args2: " + arguments[2]);

                send(arguments[2])
                // arguments[2] = "?"

                return cbInterface.onResult.apply(this, arguments);
            }

            var context = Java.use('android.app.ActivityThread').currentApplication();

            // let WatchMan = Java.use("com.netease.mobsec.WatchMan");
            let cb = Java.use("com.example.gita.gxty.utils.a0$b")
            let cbInstance = cb.$new(null)


            let a0 = Java.use("com.example.gita.gxty.utils.a0");
            let a0a = Java.use("com.example.gita.gxty.utils.a0$a")
            a0a.onResult.implementation = function (i, str) {
                console.log(`onResult is called ${i} ${str}`);
                return this.onResult(i, str);
            };

            a0.b(context)
            // WatchMan.init(context, "YD00169669632372", null, a0a.$new())

            setTimeout(function () {
                WatchMan.setSeniorCollectStatus(true);
                WatchMan.getToken(cbInstance)
                WatchMan.setSeniorCollectStatus(false);
            }, 1000)
        })

        // unpin();


        // let activityClass = Java.use("com.example.gita.gxty.ram.SignListActivity");
        // activityClass.onCreate.implementation = function () {
        //     return this.$super.apply(this, arguments)
        // }
        // activityClass.$init.implementation = function () {
        //
        // }
        // let activity = activityClass.$new()
        // let fclass = Java.use("com.example.gita.gxty.ram.SignListActivity$f");
        // let f = fclass.$new(activityClass)


        // let cbInstance = cbInterface.$new(f)
        //
        // WatchMan.getToken(cbInstance)
    });
})


function unpin() {
    /// -- Generic hook to protect against SSLPeerUnverifiedException -- ///

    // In some cases, with unusual cert pinning approaches, or heavy obfuscation, we can't
    // match the real method & package names. This is a problem! Fortunately, we can still
    // always match built-in types, so here we spot all failures that use the built-in cert
    // error type (notably this includes OkHttp), and after the first failure, we dynamically
    // generate & inject a patch to completely disable the method that threw the error.
    try {
        const UnverifiedCertError = Java.use('javax.net.ssl.SSLPeerUnverifiedException');
        UnverifiedCertError.$init.implementation = function (str) {
            try {
                const stackTrace = Java.use('java.lang.Thread').currentThread().getStackTrace();
                const exceptionStackIndex = stackTrace.findIndex(stack =>
                    stack.getClassName() === "javax.net.ssl.SSLPeerUnverifiedException"
                );
                const callingFunctionStack = stackTrace[exceptionStackIndex + 1];

                const className = callingFunctionStack.getClassName();
                const methodName = callingFunctionStack.getMethodName();

                const callingClass = Java.use(className);
                const callingMethod = callingClass[methodName];

                if (callingMethod.implementation) return; // Already patched by Frida - skip it

                const returnTypeName = callingMethod.returnType.type;

                callingMethod.implementation = function () {

                    // This is not a perfect fix! Most unknown cases like this are really just
                    // checkCert(cert) methods though, so doing nothing is perfect, and if we
                    // do need an actual return value then this is probably the best we can do,
                    // and at least we're logging the method name so you can patch it manually:

                    if (returnTypeName === 'void') {
                        return;
                    } else {
                        return null;
                    }
                };

            } catch (e) {
            }

            return this.$init(str);
        };
    } catch (err) {
    }

    /// -- Specific targeted hooks: -- ///

    // HttpsURLConnection
    try {
        const HttpsURLConnection = Java.use("javax.net.ssl.HttpsURLConnection");
        HttpsURLConnection.setDefaultHostnameVerifier.implementation = function (hostnameVerifier) {
            return; // Do nothing, i.e. don't change the hostname verifier
        };
    } catch (err) {
    }
    try {
        const HttpsURLConnection = Java.use("javax.net.ssl.HttpsURLConnection");
        HttpsURLConnection.setSSLSocketFactory.implementation = function (SSLSocketFactory) {
            return; // Do nothing, i.e. don't change the SSL socket factory
        };
    } catch (err) {
    }
    try {
        const HttpsURLConnection = Java.use("javax.net.ssl.HttpsURLConnection");
        HttpsURLConnection.setHostnameVerifier.implementation = function (hostnameVerifier) {
            return; // Do nothing, i.e. don't change the hostname verifier
        };
    } catch (err) {
    }

    // SSLContext
    try {
        const X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
        const SSLContext = Java.use('javax.net.ssl.SSLContext');

        const TrustManager = Java.registerClass({
            // Implement a custom TrustManager
            name: 'dev.asd.test.TrustManager',
            implements: [X509TrustManager],
            methods: {
                checkClientTrusted: function (chain, authType) {
                },
                checkServerTrusted: function (chain, authType) {
                },
                getAcceptedIssuers: function () {
                    return [];
                }
            }
        });

        // Prepare the TrustManager array to pass to SSLContext.init()
        const TrustManagers = [TrustManager.$new()];

        // Get a handle on the init() on the SSLContext class
        const SSLContext_init = SSLContext.init.overload(
            '[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom'
        );

        // Override the init method, specifying the custom TrustManager
        SSLContext_init.implementation = function (keyManager, trustManager, secureRandom) {
            SSLContext_init.call(this, keyManager, TrustManagers, secureRandom);
        };
    } catch (err) {
    }

    // TrustManagerImpl (Android > 7)
    try {
        const array_list = Java.use("java.util.ArrayList");
        const TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');

        // This step is notably what defeats the most common case: network security config
        TrustManagerImpl.checkTrustedRecursive.implementation = function (a1, a2, a3, a4, a5, a6) {
            return array_list.$new();
        }

        TrustManagerImpl.verifyChain.implementation = function (untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
            return untrustedChain;
        };
    } catch (err) {
    }

    // OkHTTPv3 (quadruple bypass)
    try {
        // Bypass OkHTTPv3 {1}
        const okhttp3_Activity_1 = Java.use('okhttp3.CertificatePinner');
        okhttp3_Activity_1.check.overload('java.lang.String', 'java.util.List').implementation = function (a, b) {
            return;
        };
    } catch (err) {
    }
    try {
        // Bypass OkHTTPv3 {2}
        // This method of CertificatePinner.check could be found in some old Android app
        const okhttp3_Activity_2 = Java.use('okhttp3.CertificatePinner');
        okhttp3_Activity_2.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function (a, b) {
            return;
        };
    } catch (err) {
    }
    try {
        // Bypass OkHTTPv3 {3}
        const okhttp3_Activity_3 = Java.use('okhttp3.CertificatePinner');
        okhttp3_Activity_3.check.overload('java.lang.String', '[Ljava.security.cert.Certificate;').implementation = function (a, b) {
            return;
        };
    } catch (err) {
    }
    try {
        // Bypass OkHTTPv3 {4}
        const okhttp3_Activity_4 = Java.use('okhttp3.CertificatePinner');
        okhttp3_Activity_4['check$okhttp'].implementation = function (a, b) {
            return;
        };
    } catch (err) {
    }

    // Trustkit (triple bypass)
    try {
        // Bypass Trustkit {1}
        const trustkit_Activity_1 = Java.use('com.datatheorem.android.trustkit.pinning.OkHostnameVerifier');
        trustkit_Activity_1.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function (a, b) {
            return true;
        };
    } catch (err) {
    }
    try {
        // Bypass Trustkit {2}
        const trustkit_Activity_2 = Java.use('com.datatheorem.android.trustkit.pinning.OkHostnameVerifier');
        trustkit_Activity_2.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function (a, b) {
            return true;
        };
    } catch (err) {
    }
    try {
        // Bypass Trustkit {3}
        const trustkit_PinningTrustManager = Java.use('com.datatheorem.android.trustkit.pinning.PinningTrustManager');
        trustkit_PinningTrustManager.checkServerTrusted.implementation = function () {
        };
    } catch (err) {
    }

    // Appcelerator Titanium
    try {
        const appcelerator_PinningTrustManager = Java.use('appcelerator.https.PinningTrustManager');
        appcelerator_PinningTrustManager.checkServerTrusted.implementation = function () {
        };
    } catch (err) {
    }

    // OpenSSLSocketImpl Conscrypt
    try {
        const OpenSSLSocketImpl = Java.use('com.android.org.conscrypt.OpenSSLSocketImpl');
        OpenSSLSocketImpl.verifyCertificateChain.implementation = function (certRefs, JavaObject, authMethod) {
        };
    } catch (err) {
    }

    // OpenSSLEngineSocketImpl Conscrypt
    try {
        const OpenSSLEngineSocketImpl_Activity = Java.use('com.android.org.conscrypt.OpenSSLEngineSocketImpl');
        OpenSSLEngineSocketImpl_Activity.verifyCertificateChain.overload('[Ljava.lang.Long;', 'java.lang.String').implementation = function (a, b) {
        };
    } catch (err) {
    }

    // OpenSSLSocketImpl Apache Harmony
    try {
        const OpenSSLSocketImpl_Harmony = Java.use('org.apache.harmony.xnet.provider.jsse.OpenSSLSocketImpl');
        OpenSSLSocketImpl_Harmony.verifyCertificateChain.implementation = function (asn1DerEncodedCertificateChain, authMethod) {
        };
    } catch (err) {
    }

    // PhoneGap sslCertificateChecker (https://github.com/EddyVerbruggen/SSLCertificateChecker-PhoneGap-Plugin)
    try {
        const phonegap_Activity = Java.use('nl.xservices.plugins.sslCertificateChecker');
        phonegap_Activity.execute.overload('java.lang.String', 'org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function (a, b, c) {
            return true;
        };
    } catch (err) {
    }

    // IBM MobileFirst pinTrustedCertificatePublicKey (double bypass)
    try {
        // Bypass IBM MobileFirst {1}
        const WLClient_Activity_1 = Java.use('com.worklight.wlclient.api.WLClient');
        WLClient_Activity_1.getInstance().pinTrustedCertificatePublicKey.overload('java.lang.String').implementation = function (cert) {
            return;
        };
    } catch (err) {
    }
    try {
        // Bypass IBM MobileFirst {2}
        const WLClient_Activity_2 = Java.use('com.worklight.wlclient.api.WLClient');
        WLClient_Activity_2.getInstance().pinTrustedCertificatePublicKey.overload('[Ljava.lang.String;').implementation = function (cert) {
            return;
        };
    } catch (err) {
    }

    // IBM WorkLight (ancestor of MobileFirst) HostNameVerifierWithCertificatePinning (quadruple bypass)
    try {
        // Bypass IBM WorkLight {1}
        const worklight_Activity_1 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
        worklight_Activity_1.verify.overload('java.lang.String', 'javax.net.ssl.SSLSocket').implementation = function (a, b) {
            return;
        };
    } catch (err) {
    }
    try {
        // Bypass IBM WorkLight {2}
        const worklight_Activity_2 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
        worklight_Activity_2.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function (a, b) {
            return;
        };
    } catch (err) {
    }
    try {
        // Bypass IBM WorkLight {3}
        const worklight_Activity_3 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
        worklight_Activity_3.verify.overload('java.lang.String', '[Ljava.lang.String;', '[Ljava.lang.String;').implementation = function (a, b) {
            return;
        };
    } catch (err) {
    }
    try {
        // Bypass IBM WorkLight {4}
        const worklight_Activity_4 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
        worklight_Activity_4.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function (a, b) {
            return true;
        };
    } catch (err) {
    }

    // Conscrypt CertPinManager
    try {
        const conscrypt_CertPinManager_Activity = Java.use('com.android.org.conscrypt.CertPinManager');
        conscrypt_CertPinManager_Activity.isChainValid.overload('java.lang.String', 'java.util.List').implementation = function (a, b) {
            return true;
        };
    } catch (err) {
    }

    // CWAC-Netsecurity (unofficial back-port pinner for Android<4.2) CertPinManager
    try {
        const cwac_CertPinManager_Activity = Java.use('com.commonsware.cwac.netsecurity.conscrypt.CertPinManager');
        cwac_CertPinManager_Activity.isChainValid.overload('java.lang.String', 'java.util.List').implementation = function (a, b) {
            return true;
        };
    } catch (err) {
    }

    // Worklight Androidgap WLCertificatePinningPlugin
    try {
        const androidgap_WLCertificatePinningPlugin_Activity = Java.use('com.worklight.androidgap.plugin.WLCertificatePinningPlugin');
        androidgap_WLCertificatePinningPlugin_Activity.execute.overload('java.lang.String', 'org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function (a, b, c) {
            return true;
        };
    } catch (err) {
    }

    // Netty FingerprintTrustManagerFactory
    try {
        const netty_FingerprintTrustManagerFactory = Java.use('io.netty.handler.ssl.util.FingerprintTrustManagerFactory');
        netty_FingerprintTrustManagerFactory.checkTrusted.implementation = function (type, chain) {
        };
    } catch (err) {
    }

    // Squareup CertificatePinner [OkHTTP<v3] (double bypass)
    try {
        // Bypass Squareup CertificatePinner {1}
        const Squareup_CertificatePinner_Activity_1 = Java.use('com.squareup.okhttp.CertificatePinner');
        Squareup_CertificatePinner_Activity_1.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function (a, b) {
            return;
        };
    } catch (err) {
    }
    try {
        // Bypass Squareup CertificatePinner {2}
        const Squareup_CertificatePinner_Activity_2 = Java.use('com.squareup.okhttp.CertificatePinner');
        Squareup_CertificatePinner_Activity_2.check.overload('java.lang.String', 'java.util.List').implementation = function (a, b) {
            return;
        };
    } catch (err) {
    }

    // Squareup OkHostnameVerifier [OkHTTP v3] (double bypass)
    try {
        // Bypass Squareup OkHostnameVerifier {1}
        const Squareup_OkHostnameVerifier_Activity_1 = Java.use('com.squareup.okhttp.internal.tls.OkHostnameVerifier');
        Squareup_OkHostnameVerifier_Activity_1.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function (a, b) {
            return true;
        };
    } catch (err) {
    }
    try {
        // Bypass Squareup OkHostnameVerifier {2}
        const Squareup_OkHostnameVerifier_Activity_2 = Java.use('com.squareup.okhttp.internal.tls.OkHostnameVerifier');
        Squareup_OkHostnameVerifier_Activity_2.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function (a, b) {
            return true;
        };
    } catch (err) {
    }

    // Android WebViewClient (double bypass)
    try {
        // Bypass WebViewClient {1} (deprecated from Android 6)
        const AndroidWebViewClient_Activity_1 = Java.use('android.webkit.WebViewClient');
        AndroidWebViewClient_Activity_1.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function (obj1, obj2, obj3) {
        };
    } catch (err) {
    }
    try {
        // Bypass WebViewClient {2}
        const AndroidWebViewClient_Activity_2 = Java.use('android.webkit.WebViewClient');
        AndroidWebViewClient_Activity_2.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.WebResourceRequest', 'android.webkit.WebResourceError').implementation = function (obj1, obj2, obj3) {
        };
    } catch (err) {
    }

    // Apache Cordova WebViewClient
    try {
        const CordovaWebViewClient_Activity = Java.use('org.apache.cordova.CordovaWebViewClient');
        CordovaWebViewClient_Activity.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function (obj1, obj2, obj3) {
            obj3.proceed();
        };
    } catch (err) {
    }

    // Boye AbstractVerifier
    try {
        const boye_AbstractVerifier = Java.use('ch.boye.httpclientandroidlib.conn.ssl.AbstractVerifier');
        boye_AbstractVerifier.verify.implementation = function (host, ssl) {
        };
    } catch (err) {
    }

}