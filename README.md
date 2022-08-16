# Ministry Mapper

A web application for the field ministry.

## Why

Pain points for traditional physical territory slips

- Use of paper that will be thrown once territory is completed. 🗑️
- Preparation of physical territory slips (Printing & Cutting). ✂️ 🖨️ 💦
- Risk of slips going missing or returned in bad & unreadable condition.
- Syncing up updates from physical slips to an online spreadsheet.
- High dependence on conductors presence for publishers to receive territory slips. For example, a conductor that is unable to attend due to unforeseen matter on that morning will have to find a way to get someone else to pick up the physical slips and distribute them.
- Time constraint to receive and return physical slips to conductors. For example, later comers and conductors have to find a way to meet each other to pass territory slips. Pubs who has other arrangements and are unable to join for lunch break have to still go to the break point to pass the physical slip.

Advantages of Ministry Mapper

- Fully digital territory slips. No more use of papers 🌳
- Near zero effort on territory servant to manage the territory data as details are already stored in the system.
- Real time collaboration. For example, multiple publishers are able to work the same territory as everyone will always see the territory data in real to near real-time. This reduces overlapping work that could waste time and cause trouble.
- Designed for offline access. If publishers has poor internet connectivity, they will still be able to use the app. Territory data entered will be automatically merged once internet access is up.
- Territories can be covered efficiently as slips are available online rather than in physical forms. If a field service group requires help on their territory, another group can easier step in to help by simply accessing their territory data.

Disadvantages of Ministry Mapper

- Initial migration work of the territory data. Territory servants will have to translate their current territory data into a json specific file to feed into the platform.
- Requires a internet device for publishers & conductors to use.
- A degree of learning curve especially for elderly and non tech-savvy publisher publishers.
- Currently optimised for countries where territories are mostly apartments/flats. (Landed/House features coming in V2)

### Usage

- To access the admin screen of a congregation, `domain/admin/<congregation code>`
  1. To assign a slip to a publisher, select territory and postal address and click on the share button.
  2. To restart territory status during a cycle, click on reset button under each postal address.
- To access a particular postal address, `domain/<postal code>`
  1. To update an unit number, tap on a unit box and update its details accordingly.

### Deployment

- Firebase Database setup

  1. Create Google account and setup firebase realtime database
  2. Prepare territory.json file that contains your territory data in the format specified.
  3. Upload Json file to real-time database
  4. Implement security rules to prevent unwanted deletions and access.

- Local deployment
  1. Setup .env with the following environment variables and their values.
     - REACT_APP_FIREBASE_API_KEY=key_from_firebase_account
     - REACT_APP_FIREBASE_AUTH_DOMAIN=domain_from_firebase_account
     - REACT_APP_FIREBASE_DB_URL=url_from_firebase_account
     - REACT_APP_FIREBASE_PROJECT_ID=id_from_firebase_account
     - REACT_APP_FIREBASE_BUCKET=bucket_from_firebase_account
     - REACT_APP_FIREBASE_SENDER_ID=sender_id_from_firebase_account
     - REACT_APP_FIREBASE_APP_ID=app_id_from_firebase_account
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
4. Firebase Real-time database - Cloud based database with real time synchronization across all clients.
