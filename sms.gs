/**
 * Sends an SMS using the message in cell C24 to the number in C9.
 */
function sendSms1() {
  const url = 'https://api.twilio.com/2010-04-01/Accounts/' + ACCOUNT_SID + '/Messages.json';
  const sheet = SpreadsheetApp.getActiveSheet();
  const payload = {
    To: sheet.getRange('C9').getValue(),
    Body: sheet.getRange('C24').getValue(),
    From: '(904) 643-7240'
  };

  UrlFetchApp.fetch(url, {
    method: 'post',
    payload,
    headers: { Authorization: 'Basic ' + Utilities.base64Encode(AUTH_TOKEN) }
  });
}

/**
 * Sends an SMS using the message in cell F24 to the number in C9.
 */
function sendSms2() {
  const url = 'https://api.twilio.com/2010-04-01/Accounts/' + ACCOUNT_SID + '/Messages.json';
  const sheet = SpreadsheetApp.getActiveSheet();
  const payload = {
    To: sheet.getRange('C9').getValue(),
    Body: sheet.getRange('F24').getValue(),
    From: '(904) 643-7240'
  };

  UrlFetchApp.fetch(url, {
    method: 'post',
    payload,
    headers: { Authorization: 'Basic ' + Utilities.base64Encode(AUTH_TOKEN) }
  });
}
