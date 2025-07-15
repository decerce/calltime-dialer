# calltime-dialer
A low-cost call time dialer for Democrats built in a Google sheet.

## Purpose
Efficient call time (20+ calls per hour) is impossible without access to a dialer tool. Prior to [Raise More](https://join.raisemore.app), which provides a two-week free trial, small campaigns typically found such tools to be prohibitively expensive starting out — but unable to raise money without them.

This tool lets you run a dialer at the [negligible price of operating the Twilio API](https://www.twilio.com/en-us/pricing); at the time of writing, $0.014 per minute for calls and $0.0083 for SMS messages. It runs from a Google Sheet and requires little technical knowledge.

## Setting Up the Dialer
1. Make a copy [of this Google Sheet](https://docs.google.com/spreadsheets/d/1Jr3z_Pssj2FlFyKt44yU7vMExjBIu94Few1TIbl7raw/edit?usp=sharing).

2. Make an account with [Twilio](https://www.twilio.com/). Add payment info and verify your phone number.

3. Add your [Twilio API credentials](https://www.twilio.com/docs/usage/requests-to-twilio) to Keys.gs.

4. Record a voicemail and upload it as an audio asset to Twilio. Put the length of the voicemail, in seconds, in cell A4 of the Dialer tab.

5. Put your own phone number, with no parentheses, dashes, or spaces, but beginning with an apostrophe and the + symbol in cell A2 of the Dialer tab.

6. Add your contacts to the Database tab. Add up to two SMS followups and up to two email followups in row 19 of the Dialer tab.

7. Click Start Session to dial your own phone number; answer the call, and then use the Previous Caller and Next Caller buttons to move between profiles in the Database tab, use the Dial button to call that number, use the End button to end a call or the session, use the Voicemail button to drop your prerecorded voicemail, and use the Text and Email buttons to send texts and emails to the contact.

## Caveats
1. Texts will send from another number, not your own. There is no easy or cheap way around this. You might need to do 10DLC registration for this.

2. This tool is not recommended for long term use. It is useful for calling friends and family, raising a small amount, and then switching to a professional dialer like [Raise More](https://join.raisemore.app) or [CallTime.AI](https://www.calltime.ai).
