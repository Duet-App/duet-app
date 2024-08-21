package io.ionic.starter;

import android.app.Activity;
import android.app.Instrumentation;
import android.content.Intent;
import android.net.Uri;
import android.provider.DocumentsContract;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.Objects;

@CapacitorPlugin(name = "StorageAccessFramework")
public class SAF extends Plugin {

    @PluginMethod()
    public void echo(PluginCall call) {
        String value = call.getString("value");

        JSObject ret = new JSObject();
        ret.put("value", value);
        call.resolve(ret);
    }

    @PluginMethod()
    public void saveInFolder(PluginCall call) {
        String filename = call.getString("filename");
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        intent.putExtra(Intent.EXTRA_TITLE, filename);

        startActivityForResult(call, intent, "saveInFolderResult");
    }

    @ActivityCallback
    private void saveInFolderResult(PluginCall call, ActivityResult result) throws FileNotFoundException {
        if(call == null) {
            return;
        }

        if(result.getResultCode() == Activity.RESULT_OK) {
            Uri uri = result.getData().getData();
            String data = call.getString("data");
            try {
                OutputStream outputStream = getActivity().getContentResolver().openOutputStream(uri);
                Writer writer = new OutputStreamWriter(outputStream);
                writer.write(data);
                writer.close();         
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            JSObject ret = new JSObject();
            ret.put("result", "Success");
            call.resolve(ret);
        }
    }

}
