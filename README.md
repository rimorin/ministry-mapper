![Screenshot 2022-08-19 at 2 10 11 PM](https://user-images.githubusercontent.com/40650158/185554709-ce94a04e-2a34-43a9-b7de-09aa7f437139.png)

A web application for the field ministry.

## Why

Pain points of traditional printed territory slips

- Use of paper that will be discarded once territory is completed. 🗑️ (Total paper used per service yr = 4 pieces (average paper use per territory) X no. of territories in the congregation)
- Preparation of printed territory slips (Designing, Printing & Cutting). ✂️ 🖨️ 💦
- Territory servants have to eyeball all returned slips for new updates. 📝 👀
- Risk of slips going missing. No one knows where is it 🤷‍♂️
- Risk of slips being returned in bad & unreadable conditions.
- High dependence on the conductor to show up for the ministry. No show ➡️ No slips ➡️ No HH ministry.

Advantages of Ministry Mapper

- Digital Technology. Slips are stored online rather than on paper. No more use of papers 🌳 and undesirable handwritings 🖊️. Nether will they go missing or be damaged for some reason.
- Near-zero management effort. Significant reduction of workload on the territory servants as records stored in the cloud. No more updating, printing & cutting on the servants part.
- Real-time collaboration. Territory records are displayed in real-time (Similar to live traffic/booking apps). This enables territory to be covered efficiently and effectively. For example, a slip can be covered by different publishers (letter writers and HH preachers together) in real-time as overlapping never (or almost never) occurs.
- High Availability. Slips are managed and distributed digitally. Zero to little disruption of the HH ministry as a result of sickness, travel delay or any unforeseen occurrences that may befall the conductor.

Disadvantages of Ministry Mapper

- Initial migration work of the territory data. Territory servants will have to translate their current territory data into a json specific file to feed into the platform.
- Internet dependency. Requires publishers to use their internet capable phones/tablets to use. System may not be applicable for countries where internet access is not readily available.
- Slight learning curve. Elderly and non tech-savvy publishers may have to overcome the challenge of transiting from paper/pen to the use of a computing device to update territory records.
- Currently optimised for countries where territories are mostly apartments/flats. (Landed/House features can be included in future versions).

### Usage

- To access the admin screen of a congregation, `domain/admin/<congregation code>`
  1. Login with admin credentials
  2. To restart territory status during a cycle, click on reset button under each postal address.
- To access the conductor screen of a congregation, `domain/conductor/<congregation code>`
  1. Login with conductor credentials
  2. To assign a slip to a publisher, select territory and postal address and click on the share button.
- To access a particular postal address, `domain/<postal code>`
  1. Login with publisher credentials (Disabled by default)
  2. To update an unit number, tap on a unit box and update its details accordingly.

### Deployment

- Firebase Database setup

  1. Create Google account and setup firebase realtime database
  2. Prepare territory.json file that contains your territory data in the format specified.
  3. Upload Json file to real-time database
  4. Implement security rules to prevent unwanted deletions and access.

- Firebase Authentication setup

  1. Setup firebase authentication
  2. Configure email/password authentication type
  3. Add email/password credentials

- Firebase Appcheck setup (Recommend to setup once app domain is active)

  1. Register domain in Google [Recaptcha](https://www.google.com/recaptcha/about/) v3 (Not enterprise).
  2. Copy public key to environment variable, `REACT_APP_FIREBASE_RECAPTCHA_PUBLIC_KEY`.
  3. Copy secret key to Firebase appcheck
  4. Enforce
  5. Build package
  6. For local developement, generate a token from Appcheck and copy key to environment variable, `REACT_APP_FIREBASE_APPCHECK_DEBUG_TOKEN`.

- Local deployment
  1. Setup .env with the following environment variables and their values.
     - REACT_APP_FIREBASE_API_KEY=key_from_firebase_account
     - REACT_APP_FIREBASE_AUTH_DOMAIN=domain_from_firebase_account
     - REACT_APP_FIREBASE_DB_URL=url_from_firebase_account
     - REACT_APP_FIREBASE_PROJECT_ID=id_from_firebase_account
     - REACT_APP_FIREBASE_BUCKET=bucket_from_firebase_account
     - REACT_APP_FIREBASE_SENDER_ID=sender_id_from_firebase_account
     - REACT_APP_FIREBASE_APP_ID=app_id_from_firebase_account
     - REACT_APP_FIREBASE_APPCHECK_DEBUG_TOKEN=token generated from appcheck
  2. Restart shell and run `npm start`
- Production deployment
  1. Run `npm run build`
  2. Copy build package into a cloud CDN provider of your choice.
  3. When deploying, ensure the following environment variables are configured.
     - REACT_APP_FIREBASE_API_KEY=key_from_firebase_account
     - REACT_APP_FIREBASE_AUTH_DOMAIN=domain_from_firebase_account
     - REACT_APP_FIREBASE_DB_URL=url_from_firebase_account
     - REACT_APP_FIREBASE_PROJECT_ID=id_from_firebase_account
     - REACT_APP_FIREBASE_BUCKET=bucket_from_firebase_account
     - REACT_APP_FIREBASE_SENDER_ID=sender_id_from_firebase_account
     - REACT_APP_FIREBASE_APP_ID=app_id_from_firebase_account

### Technologies Used

1. Bootstrap - CSS Framework
2. ReactJs - Javascript UI Framework
3. Typescript - Javascript typed implementation library
5. Firebase Real-time database - Cloud based database with real time synchronization across all clients.
6. Firebase Authentication - Cloud based authentication service.
7. Firebase Appcheck - Protects your app from abuse by attesting that incoming traffic and blocking traffic without valid credentials.
