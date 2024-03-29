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

- Initial migration work of the territory data. Territory servants will have to take some time to enter their entire territory details into the system.
- Internet dependency. Requires publishers to use their internet capable phones/tablets to use. System may not be applicable for countries where internet access is not readily available.
- Slight learning curve. Elderly and non tech-savvy publishers may have to overcome the challenge of transiting from paper/pen to the use of a computing device to update territory records.

### Usage

Configuration is done using a seperate [administration module](https://github.com/rimorin/ministry-mapper-admin).

1. Create account
2. Configure user roles
3. Configure congregation
4. Access url, https://your_domain/congregation_code to begin administering.

### Deployment

- Firebase Database setup

  1. Create Google account and setup firebase realtime database
  2. Implement security rules to prevent unwanted deletions and access.

- Firebase Appcheck setup (Recommend to setup once app domain is active)

  1. Register domain in Google [Recaptcha](https://www.google.com/recaptcha/about/) enterprise.
  2. Copy public key to environment variable, `VITE_FIREBASE_RECAPTCHA_ENTERPRISE_SITE_KEY`.
  3. Copy secret key to Firebase appcheck
  4. Enforce
  5. Build package
  6. For local developement, generate a token from Appcheck and copy key to environment variable, `VITE_FIREBASE_APPCHECK_DEBUG_TOKEN`.

- Firebase Functions. Refer to [documentation](https://github.com/rimorin/ministry-mapper-cron) for deployment.

- Rollbar setup

  1. Create [Rollbar](https://rollbar.com/) account
  2. Create a React project
  3. Go to setting and retrieve client keys DSN.
  4. Copy access token to environment variable, `VITE_ROLLBAR_ACCESS_TOKEN` when building for production.

- Local deployment
  1. Setup .env with the following environment variables and their values.
     - VITE_FIREBASE_API_KEY=key_from_firebase_account
     - VITE_FIREBASE_AUTH_DOMAIN=domain_from_firebase_account
     - VITE_FIREBASE_DB_URL=url_from_firebase_account
     - VITE_FIREBASE_PROJECT_ID=id_from_firebase_account
     - VITE_FIREBASE_BUCKET=bucket_from_firebase_account
     - VITE_FIREBASE_SENDER_ID=sender_id_from_firebase_account
     - VITE_FIREBASE_APP_ID=app_id_from_firebase_account
     - VITE_FIREBASE_APPCHECK_DEBUG_TOKEN=token generated from appcheck
  2. Restart shell and run `npm start`
- Production deployment
  1. Run `npm run build`
  2. Copy build package into a cloud CDN provider of your choice.
  3. When deploying, ensure the following environment variables are configured.
     - VITE_FIREBASE_API_KEY=key_from_firebase_account
     - VITE_FIREBASE_AUTH_DOMAIN=domain_from_firebase_account
     - VITE_FIREBASE_DB_URL=url_from_firebase_account
     - VITE_FIREBASE_PROJECT_ID=id_from_firebase_account
     - VITE_FIREBASE_BUCKET=bucket_from_firebase_account
     - VITE_FIREBASE_SENDER_ID=sender_id_from_firebase_account
     - VITE_FIREBASE_APP_ID=app_id_from_firebase_account
     - VITE_SENTRY_LOGGING_DSN=DSN from Sentry account

### Technologies Used

1. Bootstrap - CSS Framework
2. Vite - Build tool
3. ReactJs - Javascript UI Framework
4. Typescript - Javascript typed implementation library
5. Rollbar - App error tracking and monitoring
6. Firebase Real-time database - Cloud based database with real time synchronization across all clients.
7. Firebase Authentication - Cloud based authentication service.
8. Firebase Appcheck - Protects your app from abuse by attesting that incoming traffic and blocking traffic without valid credentials.
9. Firebase Functions - Cloud based backend job scheduler
10. MailerSend - Email delivery service
