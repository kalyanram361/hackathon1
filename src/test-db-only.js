import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

console.log('Testing Supabase connection...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'Missing');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function testDB() {
    try {
        const result = await pool.query('SELECT NOW(), current_database(), current_user');
        console.log('✅ Connection successful!');
        console.log('Time:', result.rows[0].now);
        console.log('Database:', result.rows[0].current_database);
        console.log('User:', result.rows[0].current_user);
        
        // Test if your tables exist
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables found:', tables.rows.map(r => r.table_name));
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
    } finally {
        await pool.end();
    }
}

testDB();