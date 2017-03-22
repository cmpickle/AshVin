package com.pickle.ashvin;

import android.app.Application;

import com.pickle.ashvin.db.Achievements;
import com.pickle.ashvin.db.Achievements_Table;
import com.pickle.ashvin.db.FartingDatabase;
import com.pickle.ashvin.db.Score;
import com.pickle.ashvin.db.Score_Table;
import com.raizlabs.android.dbflow.config.FlowConfig;
import com.raizlabs.android.dbflow.config.FlowManager;
import com.raizlabs.android.dbflow.sql.language.SQLite;
import com.raizlabs.android.dbflow.sql.language.property.Property;

/**
 * @author Cameron Pickle
 *         Copyright (C) Cameron Pickle (cmpickle) on 3/20/2017.
 */

public class BaseApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        FlowManager.init(new FlowConfig.Builder(this).openDatabasesOnInit(true).build());
        if(SQLite.select().from(Achievements.class).where().count() == 0) {
            SQLite.insert(Achievements.class)
                    .columns(Achievements_Table.bronze, Achievements_Table.silver, Achievements_Table.gold, Achievements_Table.coins_50, Achievements_Table.superfart)
                    .values(false, false, false, false, false)
                    .execute();
        }
        if(SQLite.select().from(Score.class).where().count() == 0) {
            SQLite.insert(Score.class)
                    .columns(Score_Table.name, Score_Table.value)
                    .values("overall", 0)
                    .values("coins", 0)
                    .values("medals", 0)
                    .execute();
        }
    }
}
