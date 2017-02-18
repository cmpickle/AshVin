/**
 * Saves achievements and score in shared preferences.
 * You should use a SQLite DB instead
 * 
 * @author Cameron Pickle
 * @author Nathan Pickle
 * Copyright (c) <2016> <Cameron Pickle - cmpickle>
 * Copyright (c) <2016> <Nathan Pickle - n8pickle>
 */

package com.pickle.ashvin;


import android.app.Activity;
import android.content.SharedPreferences;

public class AccomplishmentBox{
    //TODO: Create a high score/statistics activity
    //TODO: Create a per level high score
    //TODO: Create a total distance traveled statistic
    //TODO: Create a per level distance traveled statistic

    /** Points needed for a gold medal */
    public static final int GOLD_POINTS = 100;
    
    /** Points needed for a silver medal */
    public static final int SILVER_POINTS = 50;
    
    /** Points needed for a bronze medal */
    public static final int BRONZE_POINTS = 10;
    
    public static final String ACCOMPLISHMENTS_SAVE = "ACCOMPLISHMENTS_SAVE";
    
    public static final String KEY_POINTS = "POINTS_KEY";
    public static final String ACHIEVEMENT_KEY_50_COINS = "ACHIEVEMENT_SURVIVE_5_MINUTES_KEY";
    public static final String ACHIEVEMENT_KEY_SUPERFART = "ACHIEVEMENT_SUPERFART_KEY";
    public static final String ACHIEVEMENT_KEY_BRONZE = "ACHIEVEMENT_BRONZE_KEY";
    public static final String ACHIEVEMENT_KEY_SILVER = "ACHIEVEMENT_SILVER_KEY";
    public static final String ACHIEVEMENT_KEY_GOLD = "ACHIEVEMENT_GOLD_KEY";
    
    int points;
    boolean achievement_50_coins;
    boolean achievement_superfart;
    boolean achievement_bronze;
    boolean achievement_silver;
    boolean achievement_gold;
    
    /**
     * Stores the score and achievements locally.
     * 
     * The accomplishments will be saved local via SharedPreferences.
     * This makes it very easy to cheat.
     * 
     * @param activity activity that is needed for shared preferences
     */
    public void saveLocal(Activity activity){
        SharedPreferences saves = activity.getSharedPreferences(ACCOMPLISHMENTS_SAVE, 0);
        SharedPreferences.Editor editor = saves.edit();
        
        if(points > saves.getInt(KEY_POINTS, 0)){
            editor.putInt(KEY_POINTS, points);
        }
        if(achievement_50_coins){
            editor.putBoolean(ACHIEVEMENT_KEY_50_COINS, true);
        }
        if(achievement_superfart){
            editor.putBoolean(ACHIEVEMENT_KEY_SUPERFART, true);
        }
        if(achievement_bronze){
            editor.putBoolean(ACHIEVEMENT_KEY_BRONZE, true);
        }
        if(achievement_silver){
            editor.putBoolean(ACHIEVEMENT_KEY_SILVER, true);
        }
        if(achievement_gold){
            editor.putBoolean(ACHIEVEMENT_KEY_GOLD, true);
        }
        
        editor.commit();
    }
    
    /**
     * reads the local stored data
     * @param activity activity that is needed for shared preferences
     * @return local stored score and achievements
     */
    public static AccomplishmentBox getLocal(Activity activity){
        AccomplishmentBox box = new AccomplishmentBox();
        SharedPreferences saves = activity.getSharedPreferences(ACCOMPLISHMENTS_SAVE, 0);
        
        box.points = saves.getInt(KEY_POINTS, 0);
        box.achievement_50_coins = saves.getBoolean(ACHIEVEMENT_KEY_50_COINS, false);
        box.achievement_superfart = saves.getBoolean(ACHIEVEMENT_KEY_SUPERFART, false);
        box.achievement_bronze = saves.getBoolean(ACHIEVEMENT_KEY_BRONZE, false);
        box.achievement_silver = saves.getBoolean(ACHIEVEMENT_KEY_SILVER, false);
        box.achievement_gold = saves.getBoolean(ACHIEVEMENT_KEY_GOLD, false);
        
        return box;
    }
}