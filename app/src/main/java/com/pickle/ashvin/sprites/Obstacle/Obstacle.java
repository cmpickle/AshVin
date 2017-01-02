/**
 * An obstacle: obstacleTop + logHead
 * 
 * @author Cameron Pickle
 * @author Nathan Pickle
 * Copyright (c) <2016> <Cameron Pickle - cmpickle>
 * Copyright (c) <2016> <Nathan Pickle - n8pickle>
 */

package com.pickle.ashvin.sprites.Obstacle;

import com.pickle.ashvin.Game;
import com.pickle.ashvin.GameView;
import com.pickle.ashvin.MainActivity;
import com.pickle.ashvin.R;
import com.pickle.ashvin.sprites.Sprite;

import android.graphics.Canvas;

public class Obstacle extends Sprite {
    private ObstacleSprite obstacleTop;
    private ObstacleSprite obstacleBottom;
    private int level;
    
    private static int collideSound = -1;
//    private static int passSound = -1;
    
    /** Necessary so the onPass method is just called once */
    public boolean isAlreadyPassed = false;

    public Obstacle(GameView view, Game game, int level) {
        super(view, game);
        this.level = level;
        switch (level) {
            case 0:
                obstacleTop = new Laser(view, game);
                obstacleBottom = new WoodLog(view, game);
                break;
            case 1:
                obstacleTop = new Laser(view, game);
                obstacleBottom = new Laser(view, game);
                break;
            case 2:
                obstacleTop = new Knife(view, game);
                obstacleBottom = new PickleJars(view, game);
                break;
            case 3:
                obstacleTop = new Sun(view, game);
                obstacleBottom = new SurfBoard(view, game);
                break;
        }
        
        if(collideSound == -1){
            collideSound = Game.soundPool.load(game, R.raw.belch, 1);
        }
//        if(passSound == -1){
//            passSound = Game.soundPool.load(game, R.raw.pass, 1);
//        }
        
        initPos();
    }
    
    /**
     * Creates a obstacleTop and a wooden obstacleBottom at the right of the screen.
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
        int y1 = (height / 10) + random - obstacleTop.getHeight();
        int y2 = (height / 10) + random + gap;

        int spacing = 0;
        switch (level) {
            case 0:
                spacing = 55;
                break;
            case 1:
                spacing = 12;
                break;
            case 2:
                spacing = 25;
                break;
            case 3:
                spacing = 0;
                break;
        }
        
        obstacleTop.init(game.getResources().getDisplayMetrics().widthPixels + spacing, y1);
        obstacleBottom.init(game.getResources().getDisplayMetrics().widthPixels, y2);
    }

    /**
     * Draws obstacleTop and obstacleBottom.
     */
    @Override
    public void draw(Canvas canvas) {
        obstacleTop.draw(canvas);
        obstacleBottom.draw(canvas);
    }

    /**
     * Checks whether both, obstacleTop and obstacleBottom, are out of range.
     */
    @Override
    public boolean isOutOfRange() {
        return obstacleTop.isOutOfRange() && obstacleBottom.isOutOfRange();
    }

    /**
     * Checks whether the obstacleTop or the obstacleBottom is colliding with the sprite.
     */
    @Override
    public boolean isColliding(Sprite sprite) {
        return obstacleTop.isColliding(sprite) || obstacleBottom.isColliding(sprite);
    }

    /**
     * Moves both, obstacleTop and obstacleBottom.
     */
    @Override
    public void move() {
        obstacleTop.move();
        obstacleBottom.move();
    }

    /**
     * Sets the speed of the obstacleTop and the obstacleBottom.
     */
    @Override
    public void setSpeedX(float speedX) {
        obstacleTop.setSpeedX(speedX);
        obstacleBottom.setSpeedX(speedX);
    }
    
    /**
     * Checks whether the obstacleTop and the obstacleBottom are passed.
     */
    @Override
    public boolean isPassed(){
        return obstacleTop.isPassed() && obstacleBottom.isPassed();
    }
    
    /**
     * Will call obstaclePassed of the game, if this is the first pass of this obstacle.
     */
    public void onPass(){
        if(!isAlreadyPassed){
            isAlreadyPassed = true;
            view.getGame().increasePoints();
//            Game.soundPool.play(passSound, MainActivity.volume, MainActivity.volume, 0, 0, 1);
        }
    }

    @Override
    public void onCollision() {
        super.onCollision();
        Game.soundPool.play(collideSound, MainActivity.volume, MainActivity.volume, 0, 0, 1);
    }

}
