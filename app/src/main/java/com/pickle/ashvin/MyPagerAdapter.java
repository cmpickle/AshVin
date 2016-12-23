package com.pickle.ashvin;

import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentPagerAdapter;
import android.support.v4.view.ViewPager;
import android.view.View;

/**
 * Created by cmpic_000 on 12/21/2016.
 */

public class MyPagerAdapter extends FragmentPagerAdapter implements ViewPager.PageTransformer {
    public final static float BIG_SCALE = 1.0f;
    public final static float SMALL_SCALE = 0.7f;
    public final static float DIFF_SCALE = BIG_SCALE - SMALL_SCALE;

    private MyLinearLayout cur = null;
    private MyLinearLayout next = null;
    private SelectLevelActivity context;
    private FragmentManager fm;
    private float scale;

    public MyPagerAdapter(SelectLevelActivity context, FragmentManager fm) {
        super(fm);
        this.fm = fm;
        this.context = context;
    }

    @Override
    public Fragment getItem(int position) {
        if(position == SelectLevelActivity.FIRST_LEVEL)
            scale = BIG_SCALE;
        else
            scale = SMALL_SCALE;

        position = position % SelectLevelActivity.LEVELS;
        return MyFragment.newInstance(context, position, scale);
    }

    @Override
    public int getCount() {
        return SelectLevelActivity.LEVELS * SelectLevelActivity.LOOPS;
    }

    @Override
    public void transformPage(View page, float position) {
        MyLinearLayout myLinearLayout = (MyLinearLayout) page.findViewById(R.id.root);
        float scale = BIG_SCALE;
        if(position > 0) {
            scale = scale - position * DIFF_SCALE;
        } else {
            scale = scale + position * DIFF_SCALE;
        }
        if(scale < 0)
            scale = 0;
        myLinearLayout.setScaleBoth(scale);
    }
}
