package io.ionic.starter;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public  void onCreate(Bundle savedInstanceState) {
        registerPlugin(SAF.class);
        super.onCreate(savedInstanceState);
    }
}
