import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
const { Pool } = pg

import { parse } from 'csv-parse/sync';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  application_name: "$ docs_simplecrud_node-postgres",
});

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
});

(async () => {
  // const client = await pool.connect()
  // const res = await client.query('SELECT NOW()')
  // console.log(res.rows[0])
  
  // client.release()

  const neighbor_name = 'Kemzow';
  await getGsheetData(neighbor_name);

  
  
})();

async function getGsheetData(neighbor_name) {
  console.log('Processing Neighbor: ' + neighbor_name);
  const gsURL = new URL(`https://docs.google.com/a/google.com/spreadsheets/d/${process.env.GSHEETS_ID}/gviz/tq?tqx=out:csv`);
  gsURL.searchParams.append('sheet', process.env.GSHEET_NAME);
  gsURL.searchParams.append('tq', `SELECT * WHERE B = '${neighbor_name}'`);

  console.log('Fetching URL: ' + gsURL)

  const gsResults = await fetch(gsURL);
  const textResults = await gsResults.text();
  const jsonResults = parse(textResults, {'columns': true});
  console.log(JSON.stringify(jsonResults));

  return jsonResults;
}
