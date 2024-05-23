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

  const derbyDates = process.env.DERBY_DATES.split(',');

  for (const derbyDateIN of derbyDates) {
    let derbyDate = new Date(derbyDateIN);
    derbyDate = derbyDate.toISOString().split('T')[0];

    await insertIntoDB(derbyDate, dbClient);
  }

  dbClient.release();
})();

async function insertIntoDB(derbyDate, dbClient) {
  console.log('Working: ' + derbyDate);
  const derbyHistoryRows = await getGsheetData('Derby History', derbyDate);

  console.log(JSON.stringify(derbyHistoryRows));

  if (derbyHistoryRows.length != 1) {
    console.log(`DerbyDate ${derbyDate} does not have exactly one row.  Skipping`);
    return false;
  }

  const derbyHistory = derbyHistoryRows[0];

  const derbyParticipationRows = await getGsheetData('Derby Participation', derbyDate);
  if (derbyParticipationRows.length == 0) {
    console.log('derbyParticipationRows does not have any data.  Skipping');
  } else {
    console.log('Beginning Transaction');
    dbClient.query('BEGIN');
    let dhQuery = `INSERT INTO derby_history VALUES (
        $1,
        (SELECT DERBY_TYPE_ID FROM l_derby_types WHERE DERBY_TYPE_NAME = $2),
        $3
      );`;

    const dhValues = [ derbyHistory['Starting Date'], derbyHistory['Type'], derbyHistory.Place ];

    console.log('About to send: ' + dhQuery);
    console.log('With values: ' + JSON.stringify(dhValues));
    let res = await dbClient.query(dhQuery, dhValues);

    const derbyParticipationArray = [];
    const dpValues = [ derbyHistory['Starting Date'] ];
    let i = 2;
    // const element = derbyParticipationRows[0];
    for (const element of derbyParticipationRows) {
      derbyParticipationArray.push(`(DEFAULT, $1, COALESCE((SELECT NEIGHBOR_ID FROM neighbors WHERE FARM_NAME = $${i++}), 0), $${i++}, $${i++}, $${i++})`);
      dpValues.push(element.Neighbor, element['Tasks Completed'], element['Tasks Assigned'], element.Points);
    }

    const dpQuery = `INSERT INTO derby_participation VALUES ${derbyParticipationArray.join(',')};`;

    console.log('About to send: ' + dpQuery);
    console.log('With values: ' + JSON.stringify(dpValues));
    res = await dbClient.query(dpQuery, dpValues);

    if (res.rowCount != derbyParticipationArray.length) {
      console.log('There was an issue inserting the data.  Expected Inserted Rows = ' + derbyParticipationArray.length);
      console.log(JSON.stringify(res));
    } else {
      console.log('Insert was successful.  COMMITTING!');
      res = await dbClient.query('COMMIT');
    }
  }
}

async function getGsheetData(sheetName, derbyDate) {
  console.log(`Processing: ${sheetName} for ${derbyDate}`);
  const gsURL = new URL(`https://docs.google.com/a/google.com/spreadsheets/d/${process.env.GSHEETS_ID}/gviz/tq?tqx=out:csv`);
  gsURL.searchParams.append('sheet', sheetName);
  gsURL.searchParams.append('tq', `SELECT * WHERE A = date '${derbyDate}'`);

  console.log('Fetching URL: ' + gsURL);

  const gsResults = await fetch(gsURL);
  const textResults = await gsResults.text();
  const jsonResults = parse(textResults, { 'columns': true });

  return jsonResults;
}

