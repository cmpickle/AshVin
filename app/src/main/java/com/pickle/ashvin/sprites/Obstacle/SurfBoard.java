package com.pickle.ashvin.sprites.Obstacle;

import android.graphics.Bitmap;

import com.pickle.ashvin.Game;
import com.pickle.ashvin.GameView;
import com.pickle.ashvin.R;
import com.pickle.ashvin.Util;

/**
 * Created by cmpic_000 on 1/2/2017.
 */

public class SurfBoard extends ObstacleSprite {

    /**
     * Static bitmap to reduce memory usage.
     */
    public static Bitmap globalBitmap;

    public SurfBoard(GameView view, Game game) {
        super(view, game);
        globalBitmap = Util.getScaledBitmapAlpha8(game, R.drawable.surfboard);
        this.bitmap = globalBitmap;
        this.width = this.bitmap.getWidth();
        this.height = this.bitmap.getHeight();
    }

    /**
     * Sets the position
     * @param x
     * @param y
     */
    public void init(int x, int y){
        this.x = x;
        this.y = y;
    }
}
