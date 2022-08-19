# Ministry Mapper

![Screenshot 2022-08-19 at 2 10 11 PM](https://user-images.githubusercontent.com/40650158/185554709-ce94a04e-2a34-43a9-b7de-09aa7f437139.png)

A web application for the field ministry.

## Why

Pain points for traditional physical territory slips

- Use of paper that will be thrown once territory is completed. 🗑️
- Preparation of physical territory slips (Printing & Cutting). ✂️ 🖨️ 💦
- Risk of slips going missing or returned in bad & unreadable condition.
- Territory servants have to read through all returned slips and update his local records for the next cycle. 📝 👀
- Trouble of rotating physical slips among multiple conductors.
- High dependence on conductors presence for publishers to receive territory slips. For example, a conductor that is unable to attend due to unforeseen matter on that morning, he will have to find a way to get someone else to pick up the slips and distribute them.
- Time constraint to receive and return physical slips to conductors. For example, later comers and conductors have to find a way to meet each other to pass territory slips. Pubs who has other arrangements and are unable to join for lunch break have to still go to the break point to pass the physical slip.

Advantages of Ministry Mapper

- Digital Technology. No more use of papers 🌳 and undesirable handwritings 🖊️ . Nether will they go missing or be damaged by publishers for some reason.
- Simple Web-based slips. There is no need to install any android/ios/windows application. Slips are accessed via internet browser and barely uses much data or battery power.
- Easy territory assignment. Conductors simply send a link to publishers via sms/whatsapp. No complicated login and registration required for publishers.
- Near-zero management effort. Significant reduction of workload on the territory servants as data is sync in the cloud. For example, if a territory needs to be covered again after a few months, simply reset its status and proceed.
- Real-time collaboration. Territory records are displayed in real-time (Similar to live traffic/booking apps). This enables territory to be covered efficiently and effectively. For example, a slip can be covered by different publishers (letter writers and HH preachers together) in real-time as overlapping never (or almost never) occurs.
- High Availability. Slips are always available online. This allows overseers/conductors to easily access them anytime and assign them to publishers. No more passing around of territory bags 📁 or forgetting to bring them.

Disadvantages of Ministry Mapper

- Initial migration work of the territory data. Territory servants will have to translate their current territory data into a json specific file to feed into the platform.
- Internet dependency. Requires publishers to use their internet capable phones/tablets to use. System may not be applicable for countries where internet access is not readily available.
- Slight learning curve. Elderly and non tech-savvy publishers may have to overcome the challenge of transiting from paper/pen to the use of a computing device to update territory records. A similar experience from hardcopy to the use of JW Library app in the ministry.
- Currently optimised for countries where territories are mostly apartments/flats. (Landed/House features coming in V2).

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
