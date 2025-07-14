/**
 * Sends an email with subject/body from the "I" columns.
 */
function sendEmail1() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const emailAddress = sheet.getRange('C11').getValue();
  const subject = sheet.getRange('I18').getValue();
  const message = sheet.getRange('I24').getValue();

  MailApp.sendEmail(emailAddress, subject, message);
}

/**
 * Sends an email with subject/body from the "L" columns.
 */
function sendEmail2() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const emailAddress = sheet.getRange('C11').getValue();
  const subject = sheet.getRange('L18').getValue();
  const message = sheet.getRange('L24').getValue();

  MailApp.sendEmail(emailAddress, subject, message);
}
