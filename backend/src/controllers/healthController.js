import supabase from '../db/supabase.js';

export const healthController = {
  async getHealth(req, res) {
    res.status(200).json({ status: 'healthy', version: '3.0.0' });
  },

  async getHealthDetailed(req, res) {
    const start = performance.now();
    let dbStatus = 'healthy';
    let dbPingMs = null;

    try {
      const t0 = performance.now();
      
      // Perform a lightweight select check on the users table
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (error) {
        dbStatus = `unhealthy: ${error.message}`;
      } else {
        dbPingMs = Math.round(performance.now() - t0);
      }
    } catch (e) {
      dbStatus = `unhealthy: ${e.message}`;
    }

    const uptimeCheckMs = Math.round(performance.now() - start);

    res.status(dbStatus === 'healthy' ? 200 : 500).json({
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      version: '3.0.0',
      checks: {
        database: {
          status: dbStatus,
          ping_ms: dbPingMs
        }
      },
      uptime_check_ms: uptimeCheckMs
    });
  },

  async getReady(req, res) {
    res.status(200).json({ ready: true });
  }
};

export default healthController;
