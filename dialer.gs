/**
 * Entry point for Twilio HTTP POST callbacks.
 * Parses URL-encoded POST data and updates the "Dialer" sheet with call status.
 * @param {{ postData: { contents: string } }} e - Event object containing POST data.
 */
function doPost(e) {
  // Parse URL-encoded parameters into an object
  const params = e.postData.contents;
  const pairs = params.split('&');
  const result = {};

  pairs.forEach(pair => {
    const [key, value = ''] = pair.split('=');
    result[key] = decodeURIComponent(value);
  });

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Dialer');

  if (result.To === result.From) {
    // Incoming or internal calls: update A11
    sheet.getRange('A11').setFormula(
      `=IFS(
        "${result.CallStatus}"="completed","Disconnected",
        "${result.CallStatus}"="in-progress","Connected",
        "${result.CallStatus}"="busy","Error: Busy",
        "${result.CallStatus}"="failed","Error: Wrong number",
        "${result.CallStatus}"="no-answer","Error: Click End",
        "${result.CallStatus}"="queued","Session requested...",
        "${result.CallStatus}"="initiated","Session requested...",
        "${result.CallStatus}"="ringing","Starting session..."
      )`
    );
  } else {
    // Outgoing calls: update A14
    sheet.getRange('A14').setFormula(
      `=IFS(
        "${result.CallStatus}"="completed","Disconnected",
        "${result.CallStatus}"="in-progress","Connected",
        "${result.CallStatus}"="busy","Busy",
        "${result.CallStatus}"="failed","Failed",
        "${result.CallStatus}"="no-answer","No Answer",
        "${result.CallStatus}"="queued","Dialing...",
        "${result.CallStatus}"="initiated","Dialing...",
        "${result.CallStatus}"="ringing","Dialing...",
        "${result.CallStatus}"="canceled","Failed"
      )`
    );
  }
}

/**
 * Converts a JavaScript object to a URL-encoded string.
 * Supports array values by repeating key=value pairs.
 * @param {Object} obj - The object to encode.
 * @returns {string} URL-encoded string.
 */
function jsonToUrlencoded(obj) {
  const enc = [];
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    const value = obj[key];
    if (Array.isArray(value)) {
      value.forEach(item => {
        enc.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
      });
    } else {
      enc.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }
  return enc.join('&');
}

/**
 * Initiates a Twilio conference call using the phone number in cell A2.
 */
function start() {
  const callUrl = 'https://api.twilio.com/2010-04-01/Accounts/' + ACCOUNT_SID + '/Calls.json';
  const dialer = SpreadsheetApp.getActiveSheet().getRange('A2').getValue();

  const payload = {
    To: dialer,
    Twiml: '<Response><Dial><Conference beep="onExit">cole</Conference></Dial></Response>',
    From: dialer,
    StatusCallback: 'https://script.google.com/macros/s/AKfycbwh40VPogLDZYrRp0V8GA2a-DdRg-_iQXZa19qhk0oSthLNuneY4yjc0WWuYQjyWp70/exec',
    StatusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    StatusCallbackMethod: 'post'
  };

  const options = {
    method: 'post',
    payload: jsonToUrlencoded(payload),
    headers: {
      Authorization: 'Basic ' + Utilities.base64Encode(AUTH_TOKEN)
    }
  };

  UrlFetchApp.fetch(callUrl, options);
}

/**
 * Adds a participant (receiver) to the Twilio conference "cole".
 */
function call() {
  const participantUrl = 'https://api.twilio.com/2010-04-01/Accounts/' + ACCOUNT_SID + '/Conferences/cole/Participants.json';
  const dialer = SpreadsheetApp.getActiveSheet().getRange('A2').getValue();
  const receiver = SpreadsheetApp.getActiveSheet().getRange('C9').getValue();

  const payload = {
    To: receiver,
    From: dialer,
    Beep: true,
    StatusCallback: 'https://script.google.com/macros/s/AKfycbwTe1jloFtbj8Gg1gnM05UniH-eyPoWmINOCus1NQiunkqprSwCfUQ5HG3usAgTfbAu3w/exec',
    StatusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    StatusCallbackMethod: 'post'
  };

  const options = {
    method: 'post',
    payload: jsonToUrlencoded(payload),
    headers: {
      Authorization: 'Basic ' + Utilities.base64Encode(AUTH_TOKEN)
    }
  };

  UrlFetchApp.fetch(participantUrl, options);
}

/**
 * Terminates an in-progress call or conference participant.
 */
function kill() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const status = sheet.getRange('A14').getValue();

  if (status === 'Dialing...') {
    drop();
    return;
  }

  const conferencesUrl = 'https://api.twilio.com/2010-04-01/Accounts/' + ACCOUNT_SID + '/Conferences.json?FriendlyName=cole&Status=in-progress';
  const options = {
    method: 'get',
    headers: {
      Authorization: 'Basic ' + Utilities.base64Encode(AUTH_TOKEN)
    }
  };

  // Fetch active conference
  const confResp = UrlFetchApp.fetch(conferencesUrl, options);
  const confList = JSON.parse(confResp).conferences;
  const conferenceSid = confList[0].sid;

  // Fetch participants in conference
  const participantsUrl = `https://api.twilio.com/2010-04-01/Accounts/' + ACCOUNT_SID + '/Conferences/${conferenceSid}/Participants.json`;
  const partResp = UrlFetchApp.fetch(participantsUrl, options);
  const participants = JSON.parse(partResp).participants;
  const targetSid = participants[0].call_sid;

  // Remove participant
  const deleteUrl = `https://api.twilio.com/2010-04-01/Accounts/' + ACCOUNT_SID + '/Conferences/${conferenceSid}/Participants/${targetSid}.json`;
  UrlFetchApp.fetch(deleteUrl, { method: 'delete', headers: options.headers });
}

/**
 * Ends a dialing session if still pending, otherwise drops the call via Twilio API.
 */
function drop() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const rawNumber = sheet.getRange('C9').getValue();
  const toNumber = rawNumber.slice(1);

  const fetchUrl = `https://api.twilio.com/2010-04-01/Accounts/' + ACCOUNT_SID + '/Calls.json?&To=${toNumber}`;
  const authHeader = 'Basic ' + Utilities.base64Encode(AUTH_TOKEN);

  // Fetch active call SID
  const resp = UrlFetchApp.fetch(fetchUrl, { method: 'get', headers: { Authorization: authHeader } });
  const calls = JSON.parse(resp).calls;  
  const callSid = calls[0].sid;

  // Complete the call
  const completeUrl = `https://api.twilio.com/2010-04-01/Accounts/' + ACCOUNT_SID + '/Calls/${callSid}.json`;
  UrlFetchApp.fetch(completeUrl, {
    method: 'post',
    payload: { Status: 'completed' },
    headers: { Authorization: authHeader }
  });
}
