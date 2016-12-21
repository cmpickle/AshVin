/**
 * Fart Pickle Character
 *
 * @author Cameron Pickle
 * @author Nathan Pickle
 * Copyright (c) <2016> <Cameron Pickle - cmpickle>
 * Copyright (c) <2016> <Nathan Pickle - n8pickle>
 */

package com.pickle.ashvin.sprites;

import com.pickle.ashvin.Game;
import com.pickle.ashvin.GameView;
import com.pickle.ashvin.R;
import com.pickle.ashvin.Util;

import android.graphics.Bitmap;
import android.graphics.Canvas;

public class FartPickle extends PlayableCharacter {
    
    /** Static bitmap to reduce memory usage */
    public static Bitmap globalBitmap;
    
    /** The fart tail behind the pickle */
    private Fart fart;
    
    public FartPickle(GameView view, Game game) {
        super(view, game);
        if(globalBitmap == null){
            globalBitmap = Util.getScaledBitmapAlpha8(game, R.drawable.fart_pickle);
        }
        this.bitmap = globalBitmap;
        this.width = this.bitmap.getWidth();
        this.height = this.bitmap.getHeight()/2;
        this.y = game.getResources().getDisplayMetrics().heightPixels / 2;
        
        this.fart = new Fart(view, game);
    }
    
    /**
     * Moves itself via super.move
     * and moves the fart and manages its frames
     */
    @Override
    public void move(){
        super.move();
        
        if(fart != null){
            manageFartMovement();
        }
    }
    
    private void manageFartMovement(){
        fart.y = this.y;        // FartPickle and fart bitmap have the same height
        fart.x = this.x - fart.width;
        fart.move();
        
        // manage frames of the fart
        if(speedY > getTabSpeed() / 3 && speedY < getMaxSpeed() * 1/3){
            fart.row = 0;
        }else if(speedY > 0){
            fart.row = 1;
        }else{
            fart.row = 2;
        }
    }

    /**
     * Draws itself via super.draw
     * and the fart.
     */
    @Override
    public void draw(Canvas canvas) {
        super.draw(canvas);
        if(fart != null && !isDead){
            fart.draw(canvas);
        }
    }

    /**
     * Calls super.dead,
     * removes the fart tail
     * and set the bitmapframe to a dead pickle
     */
    @Override
    public void dead() {
        super.dead();
        this.row = 1;
        
        // Maybe an explosion
    }

    @Override
    public void revive() {
        super.revive();
        manageFartMovement();
    }

}
