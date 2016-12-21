/**
 * An obstacle: laser + logHead
 * 
 * @author Lars Harmsen
 * Copyright (c) <2014> <Lars Harmsen - Quchen>
 */

package com.pickle.ashvin.sprites;

import com.pickle.ashvin.Game;
import com.pickle.ashvin.GameView;
import com.pickle.ashvin.MainActivity;
import com.pickle.ashvin.R;

import android.graphics.Canvas;

public class Obstacle extends Sprite{
    private Laser laser;
    private WoodLog log;
    
    private static int collideSound = -1;
    private static int passSound = -1;
    
    /** Necessary so the onPass method is just called once */
    public boolean isAlreadyPassed = false;

    public Obstacle(GameView view, Game game) {
        super(view, game);
        laser = new Laser(view, game);
        log = new WoodLog(view, game);
        
        if(collideSound == -1){
            collideSound = Game.soundPool.load(game, R.raw.belch, 1);
        }
        if(passSound == -1){
            passSound = Game.soundPool.load(game, R.raw.pass, 1);
        }
        
        initPos();
    }
    
    /**
     * Creates a laser and a wooden log at the right of the screen.
     * With a certain gap between them.
     * The vertical position is in a certain area random.
     */
    private void initPos(){
        int height = game.getResources().getDisplayMetrics().heightPixels;
        int gap = height / 4 - view.getSpeedX();
        if(gap < height / 5){
            gap = height / 5;
        }
        int random = (int) (Math.random() * height * 2 / 5);
        int y1 = (height / 10) + random - laser.height;
        int y2 = (height / 10) + random + gap;
        
        laser.init(game.getResources().getDisplayMetrics().widthPixels + 55, y1);
        log.init(game.getResources().getDisplayMetrics().widthPixels, y2);
    }

    /**
     * Draws laser and log.
     */
    @Override
    public void draw(Canvas canvas) {
        laser.draw(canvas);
        log.draw(canvas);
    }

    /**
     * Checks whether both, laser and log, are out of range.
     */
    @Override
    public boolean isOutOfRange() {
        return laser.isOutOfRange() && log.isOutOfRange();
    }

    /**
     * Checks whether the laser or the log is colliding with the sprite.
     */
    @Override
    public boolean isColliding(Sprite sprite) {
        return laser.isColliding(sprite) || log.isColliding(sprite);
    }

    /**
     * Moves both, laser and log.
     */
    @Override
    public void move() {
        laser.move();
        log.move();
    }

    /**
     * Sets the speed of the laser and the log.
     */
    @Override
    public void setSpeedX(float speedX) {
        laser.setSpeedX(speedX);
        log.setSpeedX(speedX);
    }
    
    /**
     * Checks whether the laser and the log are passed.
     */
    @Override
    public boolean isPassed(){
        return laser.isPassed() && log.isPassed();
    }
    
    /**
     * Will call obstaclePassed of the game, if this is the first pass of this obstacle.
     */
    public void onPass(){
        if(!isAlreadyPassed){
            isAlreadyPassed = true;
            view.getGame().increasePoints();
            Game.soundPool.play(passSound, MainActivity.volume, MainActivity.volume, 0, 0, 1);
        }
    }

    @Override
    public void onCollision() {
        super.onCollision();
        Game.soundPool.play(collideSound, MainActivity.volume, MainActivity.volume, 0, 0, 1);
    }

}
