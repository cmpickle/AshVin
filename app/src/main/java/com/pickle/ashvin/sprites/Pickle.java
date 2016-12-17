/**
 * The fart that is controlled by the player
 * 
 * @author Lars Harmsen
 * Copyright (c) <2014> <Lars Harmsen - Quchen>
 */

package com.pickle.ashvin.sprites;

import com.pickle.ashvin.Game;
import com.pickle.ashvin.GameView;
import com.pickle.ashvin.MainActivity;
import com.pickle.ashvin.R;
import com.pickle.ashvin.Util;

import android.graphics.Bitmap;
import android.graphics.Canvas;

import java.util.Random;

public class Pickle extends PlayableCharacter {
    
    private static final int POINTS_TO_SIR = 23;
    private static final int POINTS_TO_COOL = 35;

    /** Static bitmap to reduce memory usage. */
    public static Bitmap globalBitmap;

    /** The moo sound */
    private static int[] sound = {-1,0,0,0};
    
    /** sunglasses, hats and stuff */
    private Accessory accessory;

    public Pickle(GameView view, Game game) {
        super(view, game);
        if(globalBitmap == null){
            globalBitmap = Util.getScaledBitmapAlpha8(game, R.drawable.pickle);
        }
        this.bitmap = globalBitmap;
        this.width = this.bitmap.getWidth()/(colNr = 8);    // The image has 8 frames in a row
        this.height = this.bitmap.getHeight()/4;            // and 4 in a column
        this.frameTime = 3;        // the frame will change every 3 runs
        this.y = game.getResources().getDisplayMetrics().heightPixels / 2;    // Startposition in in the middle of the screen
        
        if(sound[0] == -1){
            sound[0] = Game.soundPool.load(game, R.raw.fart0, 1);
            sound[1] = Game.soundPool.load(game, R.raw.fart1, 1);
            sound[2] = Game.soundPool.load(game, R.raw.fart2, 1);
            sound[3] = Game.soundPool.load(game, R.raw.fart3, 1);
        }
        
        this.accessory = new Accessory(view, game);
    }
    
    private void playSound(){
        Random rand = new Random();
        Game.soundPool.play(sound[rand.nextInt(4)], MainActivity.volume, MainActivity.volume, 0, 0, 1);
    }

    @Override
    public void onTap(){
        super.onTap();
        playSound();
    }
    
    /**
     * Calls super.move
     * and manages the frames. (flattering cape)
     */
    @Override
    public void move(){
        changeToNextFrame();
        super.move();
        
        // manage frames
        if(row != 3){
            // not dead
            if(speedY > getTabSpeed() / 3 && speedY < getMaxSpeed() * 1/3){
                row = 0;
            }else if(speedY > 0){
                row = 1;
            }else{
                row = 2;
            }
        }
        
        if(this.accessory != null){
            this.accessory.moveTo(this.x, this.y);
        }
    }

    @Override
    public void draw(Canvas canvas) {
        super.draw(canvas);
        if(this.accessory != null && !isDead){
            this.accessory.draw(canvas);
        }
    }

    /**
     * Calls super.dead
     * And changes the frame to a dead fart -.-
     */
    @Override
    public void dead() {
        this.row = 3;
        this.frameTime = 3;
        super.dead();
    }
    
    @Override
    public void revive() {
        super.revive();
        this.accessory.setBitmap(Util.getScaledBitmapAlpha8(game, R.drawable.accessory_scumbag));
    }

    @Override
    public void upgradeBitmap(int points) {
        super.upgradeBitmap(points);
        if(points == POINTS_TO_SIR){
            this.accessory.setBitmap(Util.getScaledBitmapAlpha8(game, R.drawable.accessory_sir));
        }else if(points == POINTS_TO_COOL){
            this.accessory.setBitmap(Util.getScaledBitmapAlpha8(game, R.drawable.accessory_sunglasses));
        }
    }
    
}
