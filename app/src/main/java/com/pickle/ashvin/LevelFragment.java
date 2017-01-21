/**
 * A fragment for storing levels
 *
 * @author Cameron Pickle
 * @author Nathan Pickle
 * Copyright (c) <2016> <Cameron Pickle - cmpickle>
 * Copyright (c) <2016> <Nathan Pickle - n8pickle>
 */

package com.pickle.ashvin;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.TextView;

public class LevelFragment extends Fragment {

    public static Fragment newInstance(SelectLevelActivity context, int pos, float  scale) {
        Bundle b = new Bundle();
        b.putInt("pos", pos);
        b.putFloat("scale", scale);
        return Fragment.instantiate(context, LevelFragment.class.getName(), b);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstance) {
        if(container == null) {
            return null;
        }

        LinearLayout l = (LinearLayout) inflater.inflate(R.layout.mf, container, false);

        int pos = this.getArguments().getInt("pos");
        TextView tv = (TextView) l.findViewById(R.id.text);
        tv.setText(this.getResources().getString(R.string.level) + " " + (pos+1));

        ImageButton button = (ImageButton) l.findViewById(R.id.content);
        switch (pos) {
            case 0:
                button.setImageResource(R.drawable.level00);
                button.setAdjustViewBounds(true);
                button.getScaleType();
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
                button.setImageResource(R.drawable.level01);
                button.setAdjustViewBounds(true);
                button.getScaleType();
                button.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        if((MainActivity.levelsUnlocked & 1) == 1) {
                            Intent intent = new Intent("com.pickle.ashvin.Game");
                            intent.putExtra(Game.KEY_EXTRA, 1);
                            startActivity(intent);
                        } else {
                            Activity activity = getActivity();
                            SelectLevelActivity selectLevelActivity  = (SelectLevelActivity) activity;
                            selectLevelActivity.buyLevelDialog.init(0);
                            selectLevelActivity.buyLevelDialog.show();
                        }
                    }
                });
                break;
            case 2:
                button.setImageResource(R.drawable.level02);
                button.setAdjustViewBounds(true);
                button.getScaleType();
                button.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        if((MainActivity.levelsUnlocked & 2) == 2) {
                            Intent intent = new Intent("com.pickle.ashvin.Game");
                            intent.putExtra(Game.KEY_EXTRA, 2);
                            startActivity(intent);
                        } else {
                            Activity activity = getActivity();
                            SelectLevelActivity selectLevelActivity  = (SelectLevelActivity) activity;
                            selectLevelActivity.buyLevelDialog.init(1);
                            selectLevelActivity.buyLevelDialog.show();
                        }
                    }
                });
                break;
            case 3:
                button.setImageResource(R.drawable.level03);
                button.setAdjustViewBounds(true);
                button.getScaleType();
                button.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        if((MainActivity.levelsUnlocked & 4) == 4) {
                            Intent intent = new Intent("com.pickle.ashvin.Game");
                            intent.putExtra(Game.KEY_EXTRA, 3);
                            startActivity(intent);
                        } else {
                            Activity activity = getActivity();
                            SelectLevelActivity selectLevelActivity  = (SelectLevelActivity) activity;
                            selectLevelActivity.buyLevelDialog.init(2);
                            selectLevelActivity.buyLevelDialog.show();
                        }
                    }
                });
        }

        LevelLinearLayout root = (LevelLinearLayout) l.findViewById(R.id.root);
        float scale = this.getArguments().getFloat("scale");
        root.setScaleBoth(scale);

        return l;
    }
}
