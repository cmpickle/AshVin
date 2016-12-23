package com.pickle.ashvin;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

public class MyFragment extends Fragment {

    public static Fragment newInstance(SelectLevelActivity context, int pos, float  scale) {
        Bundle b = new Bundle();
        b.putInt("pos", pos);
        b.putFloat("scale", scale);
        return Fragment.instantiate(context, MyFragment.class.getName(), b);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstance) {
        if(container == null) {
            return null;
        }

        LinearLayout l = (LinearLayout) inflater.inflate(R.layout.mf, container, false);

        int pos = this.getArguments().getInt("pos");
        TextView tv = (TextView) l.findViewById(R.id.text);
        tv.setText("Level " + (pos+1));

        ImageButton button = (ImageButton) l.findViewById(R.id.content);
        switch (pos) {
            case 0:
                button.setImageResource(R.drawable.bg00);
                button.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        Intent intent = new Intent("com.pickle.ashvin.Game");
                        intent.putExtra(Game.KEY_EXTRA, 0);
                        startActivity(intent);
                    }
                });
                break;
            case 1:
                button.setImageResource(R.drawable.bg01);
                button.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        if(MainActivity.levelsUnlocked-1 >= 0) {
                            Intent intent = new Intent("com.pickle.ashvin.Game");
                            intent.putExtra(Game.KEY_EXTRA, 1);
                            startActivity(intent);
                        } else {
                            SelectLevelActivity.selectLevelActivity.buyLevelDialog.init();
                            SelectLevelActivity.selectLevelActivity.buyLevelDialog.show();
                        }
                    }
                });
                break;
        }

        MyLinearLayout root = (MyLinearLayout) l.findViewById(R.id.root);
        float scale = this.getArguments().getFloat("scale");
        root.setScaleBoth(scale);

        return l;
    }
}