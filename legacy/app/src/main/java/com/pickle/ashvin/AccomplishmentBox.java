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



import com.pickle.ashvin.db.Achievements;
import com.pickle.ashvin.db.Achievements_Table;
import com.pickle.ashvin.db.Score;
import com.pickle.ashvin.db.Score_Table;
import com.raizlabs.android.dbflow.sql.language.SQLite;

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
    
    int points;
    boolean achievement_50_coins;
    boolean achievement_superfart;
    boolean achievement_bronze;
    boolean achievement_silver;
    boolean achievement_gold;
    Achievements achievements;
    Score score;
    
    /**
     * Stores the score and achievements locally.
     */
    public void saveLocal(){
        achievements = SQLite.select().from(Achievements.class).querySingle();
        score = SQLite.select().from(Score.class).where(Score_Table.name.eq("overall")).querySingle();

        if(points > score.getValue()){
            SQLite.update(Score.class).set(Score_Table.value.eq(points)).where(Score_Table.name.eq("overall")).execute();
        }
        if(achievement_50_coins){
            SQLite.update(Achievements.class).set(Achievements_Table.value.eq(true)).where(Achievements_Table.name.eq("50coins")).execute();
        }
        if(achievement_superfart){
            SQLite.update(Achievements.class).set(Achievements_Table.value.eq(true)).where(Achievements_Table.name.eq("superfart")).execute();
        }
        if(achievement_bronze){
            SQLite.update(Achievements.class).set(Achievements_Table.value.eq(true)).where(Achievements_Table.name.eq("bronze")).execute();
        }
        if(achievement_silver){
            SQLite.update(Achievements.class).set(Achievements_Table.value.eq(true)).where(Achievements_Table.name.eq("silver")).execute();
        }
        if(achievement_gold){
            SQLite.update(Achievements.class).set(Achievements_Table.value.eq(true)).where(Achievements_Table.name.eq("gold")).execute();
        }
    }
    
    /**
     * reads the local stored data
     * @return local stored score and achievements
     */
    public static AccomplishmentBox getLocal(){
        AccomplishmentBox box = new AccomplishmentBox();

        box.points = SQLite.select().from(Score.class).where(Score_Table.name.eq("overall")).querySingle().getValue();
        box.achievement_50_coins = SQLite.select().from(Achievements.class).where(Achievements_Table.name.eq("50coins")).querySingle().getValue();
        box.achievement_superfart = SQLite.select().from(Achievements.class).where(Achievements_Table.name.eq("50coins")).querySingle().getValue();
        box.achievement_bronze = SQLite.select().from(Achievements.class).where(Achievements_Table.name.eq("50coins")).querySingle().getValue();
        box.achievement_silver = SQLite.select().from(Achievements.class).where(Achievements_Table.name.eq("50coins")).querySingle().getValue();
        box.achievement_gold = SQLite.select().from(Achievements.class).where(Achievements_Table.name.eq("50coins")).querySingle().getValue();
        
        return box;
    }
}