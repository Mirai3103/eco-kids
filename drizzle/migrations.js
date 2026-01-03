// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_cold_princess_powerful.sql';
import m0001 from './0001_dusty_queen_noir.sql';
import m0002 from './0002_long_shockwave.sql';
import m0003 from './0003_smooth_omega_sentinel.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003
    }
  }
  