export async function actionLogEtl(neighbor_name, dbClient) {
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
