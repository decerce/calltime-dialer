/**
 * Advances to the next note in the Database sheet and clears input.
 */
function next() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const date = new Date();
  const todayStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

  const countRange = ss.getRange('A8');
  const index = countRange.getValue();

  const sheet = ss.getSheetByName('Database');
  const oldNote = ss.getRange('L7').getValue();
  const newNote = ss.getRange('I7').getValue();

  sheet.getRange(`E${index + 1}`).setValue(`${oldNote}\n${todayStr}: ${newNote}`);
  countRange.setValue(index + 1);
  ss.getSheetByName('Dialer').getRange('I7').clearContent();
}

/**
 * Moves to the previous note index and clears input.
 */
function previous() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const countRange = ss.getRange('A8');
  const index = countRange.getValue();
  countRange.setValue(index - 1);
  ss.getSheetByName('Dialer').getRange('I7').clearContent();
}
