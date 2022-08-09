# Ministry Mapper

A web application for the field ministry.

## Why

Pain points
  - Printing of physical territory slips
  - Risk of slips going missing
  - Syncing up updates from physical slips to online spreadsheet
  - Publishers highly depend on conductors presence to receive the slips
  - Time constraint to receive and return physical slips to conductors
  
Advantages
  - Fully digital territory slips
  - Real time collaboration. Multiple publishers as able to work the same territory as everyone is in sync.
  - Cloud based. Territory data are synced to the cloud.
  - Offline access. If client loses its internet connectivity, system will cache any changes locally first until internet is up.
  - Territories can be covered efficiently as slips are available online rather than in physical forms.

Disadvantages
  - Initial migration work of the territory data.
  - Requires a internet device for publisher/conductor to use.
  
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
