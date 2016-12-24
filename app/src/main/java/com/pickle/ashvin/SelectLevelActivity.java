package com.pickle.ashvin;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.support.v4.app.FragmentActivity;
import android.support.v4.view.ViewPager;
import android.widget.TextView;

public class SelectLevelActivity extends FragmentActivity {

    /** Name of the SharedPreference that saves the medals */
    public static final String coin_save = "coin_save";
    public static final String coin_key = "coin_key";
    int coins;

    public final static int LEVELS = 2;

    public final static int LOOPS = 1000;
    public final static int FIRST_LEVEL = LEVELS * LOOPS /2;

    public MyPagerAdapter adapter;
    public ViewPager pager;

    BuyLevelDialog buyLevelDialog;
    public static SelectLevelActivity selectLevelActivity;

    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_select_level);

        pager = (ViewPager) findViewById(R.id.myviewpager);

        adapter = new MyPagerAdapter(this, this.getSupportFragmentManager());
        pager.setAdapter(adapter);
        pager.setPageTransformer(false, adapter);

        pager.setCurrentItem(FIRST_LEVEL);

        pager.setOffscreenPageLimit(3);

        pager.setPageMargin(-200);

        buyLevelDialog = new BuyLevelDialog(this, findViewById(R.id.myviewpager));

        loadCoins();
    }

    @Override
    public void onResume() {
        super.onResume();
        selectLevelActivity = this;

        loadCoins();

        TextView tv = (TextView) findViewById(R.id.tv_current_coins);
        tv.setText("Coins " + coins);
    }

    private void loadCoins(){
        SharedPreferences saves = this.getSharedPreferences(coin_save, 0);
        this.coins = saves.getInt(coin_key, 0);
    }

    public void startLevel(int level) {
        Intent intent = new Intent("com.pickle.ashvin.Game");
        intent.putExtra(Game.KEY_EXTRA, level);
        getApplicationContext().startActivity(intent);
    }
}
