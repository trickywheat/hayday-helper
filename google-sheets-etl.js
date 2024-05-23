import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
const { Pool } = pg;

import { parse } from 'csv-parse/sync';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  application_name: '$ docs_simplecrud_node-postgres',
});

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

(async () => {
  const dbClient = await pool.connect();
  // const res = await client.query('SELECT NOW()')
  // console.log(res.rows[0])

  const neighbors = process.env.NEIGHBORS.split(',');

  for (const neighbor of neighbors) {
    await insertIntoDB(neighbor, dbClient);
  }

  dbClient.release();
})();

async function insertIntoDB(neighbor_name, dbClient) {
  console.log('Working: ' + neighbor_name);
  const neighborRows = await getGsheetData(neighbor_name);

  console.log(JSON.stringify(neighborRows));

  if (neighborRows.length == 0)
    console.log(`Neighbor ${neighbor_name} does not have any rows.  Skipping.`);

  for (const element of neighborRows) {
    const query = `INSERT INTO action_log 
                      VALUES (
                        DEFAULT, 
                        $1, 
                        (SELECT NEIGHBOR_ID FROM neighbors WHERE FARM_NAME = $2),
                        (SELECT ACTION_TYPE_ID FROM l_action_types WHERE ACTION_TYPE_NAME = $3),
                        $4
                      )`;
    const values = [ element.Date, element.Neighbor, element['Action Type'], element.Note.length > 0 ? `'${element.Note}'` : 'NULL' ];

    console.log('About to send: ' + query);
    console.log('With values: ' + JSON.stringify(values));
    const res = await dbClient.query(query, values);

    if (res.rowCount != 1) {
      console.log('There was an issue inserting the row: ');
      console.log(JSON.stringify(res));
    }
  }
}

async function getGsheetData(neighbor_name) {
  console.log('Processing Neighbor: ' + neighbor_name);
  const gsURL = new URL(`https://docs.google.com/a/google.com/spreadsheets/d/${process.env.GSHEETS_ID}/gviz/tq?tqx=out:csv`);
  gsURL.searchParams.append('sheet', process.env.GSHEET_NAME);
  gsURL.searchParams.append('tq', `SELECT * WHERE B = '${neighbor_name}'`);

  console.log('Fetching URL: ' + gsURL);

  const gsResults = await fetch(gsURL);
  const textResults = await gsResults.text();
  const jsonResults = parse(textResults, { 'columns': true });

  return jsonResults;
}

