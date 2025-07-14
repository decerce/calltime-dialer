/**
 * Plays a predefined voicemail message in the active conference and then hangs up after configured duration.
 */
function voicemail() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const voicemailLength = sheet.getRange('A4').getValue();

  const conferencesUrl = 'https://api.twilio.com/2010-04-01/Accounts/' + ACCOUNT_SID + '/Conferences.json?FriendlyName=calltime&Status=in-progress';
  const headers = { Authorization: 'Basic ' + Utilities.base64Encode(AUTH_TOKEN) };
  const options = { method: 'get', headers };

  // Get active conference SID
  const confResp = UrlFetchApp.fetch(conferencesUrl, options);
  const conferenceSid = JSON.parse(confResp).conferences[0].sid;

  // Get first participant call SID
  const participantsUrl = `https://api.twilio.com/2010-04-01/Accounts/' + ACCOUNT_SID + '/Conferences/${conferenceSid}/Participants.json`;
  const partResp = UrlFetchApp.fetch(participantsUrl, options);
  const callSid = JSON.parse(partResp).participants[0].call_sid;

  // Place caller on hold with voicemail URL
  const holdUrl = `https://api.twilio.com/2010-04-01/Accounts/' + ACCOUNT_SID + '/Conferences/${conferenceSid}/Participants/${callSid}.json`;
  const holdPayload = { Hold: true, HoldUrl: VOICEMAIL_RECORDING };

  UrlFetchApp.fetch(holdUrl, { method: 'post', payload: holdPayload, headers });

  // Wait for voicemail duration then hang up
  Utilities.sleep(voicemailLength * 1000);
  UrlFetchApp.fetch(holdUrl, { method: 'delete', headers });
}
