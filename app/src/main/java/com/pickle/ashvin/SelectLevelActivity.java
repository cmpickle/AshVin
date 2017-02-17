/**
 * An activity to select the level
 *
 * @author Cameron Pickle
 * @author Nathan Pickle
 * Copyright (c) <2016> <Cameron Pickle - cmpickle>
 * Copyright (c) <2016> <Nathan Pickle - n8pickle>
 */

package com.pickle.ashvin;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.support.v4.app.FragmentActivity;
import android.support.v4.view.ViewPager;
import android.widget.TextView;

public class SelectLevelActivity extends FragmentActivity {

    /** Name of the SharedPreference that saves the medals */
    public static final String coin_save = "COIN_SAVE";
    public static final String coin_key = "COIN_KEY";
    int coins;

    public final static int LEVELS = 4;

    public final static int LOOPS = 1000;
    public final static int FIRST_LEVEL = LEVELS * LOOPS /2;

    public LevelPagerAdapter adapter;
    public ViewPager pager;

    BuyLevelDialog buyLevelDialog;

    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_select_level);

        pager = (ViewPager) findViewById(R.id.myviewpager);

        adapter = new LevelPagerAdapter(this, this.getSupportFragmentManager());
        pager.setAdapter(adapter);
        pager.setPageTransformer(false, adapter);

        pager.setCurrentItem(FIRST_LEVEL);

        pager.setOffscreenPageLimit(3);

        pager.setPageMargin(-300);

        buyLevelDialog = new BuyLevelDialog(this, findViewById(R.id.myviewpager));

        loadCoins();
    }

    @Override
    public void onResume() {
        super.onResume();

        loadCoins();

        TextView tv = (TextView) findViewById(R.id.tv_current_coins);
        tv.setText(this.getResources().getString(R.string.current_coin) + " " + coins);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        adapter = null;
        pager.removeAllViews();
        pager = null;
        buyLevelDialog = null;
    }

    private void loadCoins(){
        SharedPreferences saves = this.getSharedPreferences(coin_save, 0);
        this.coins = saves.getInt(coin_key, 0);
    }
}
