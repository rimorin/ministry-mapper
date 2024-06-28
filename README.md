![Screenshot 2022-08-19 at 2 10 11 PM](https://user-images.githubusercontent.com/40650158/185554709-ce94a04e-2a34-43a9-b7de-09aa7f437139.png)

A web application for the field ministry.

**Important Notice**: Ministry Mapper incorporates the capability to track residential addresses, a feature that may raise concerns under strict data privacy regulations in certain jurisdictions. We urge users to conduct a comprehensive review of their local data protection laws and ensure adherence to all applicable guidelines before implementing Ministry Mapper. This proactive approach will safeguard your ministry activities against potential legal challenges.

## Why Ministry Mapper Stands Out

Facing the Challenges of Traditional Printed Territory Management:

- **Environmental Concerns**: The conventional approach relies heavily on paper, leading to significant environmental waste. Imagine the impact: each congregation uses approximately four sheets of paper per territory, a number that quickly adds up with each territory managed throughout the year.
- **Operational Burdens**: Designing, printing, and preparing territory slips is not only resource-intensive but also time-consuming, diverting valuable time from ministry work.
- **Update Inefficiencies**: The manual process of updating returned slips is prone to errors and can be incredibly tedious, often resulting in outdated or inaccurate territory records.
- **Risk of Loss or Damage**: Paper slips are susceptible to being lost or returned in a state that renders them unusable, creating gaps in territory coverage and hindering ministry efforts.
- **Dependence on Availability**: The effectiveness of the traditional system hinges on the physical presence of the territory conductor. Their absence can lead to disruptions in ministry activities.

### The Ministry Mapper Advantage

- **Eco-Friendly Efficiency**: Transitioning to Ministry Mapper eliminates the need for paper, significantly reducing your environmental footprint while addressing common issues such as legibility and damage to physical slips.

- **Simplified Territory Management**: Our cloud-based platform dramatically lightens the load for territory servants. With digital records, the cumbersome tasks of manual updates, printing, and cutting become things of the past.

- **Real-Time Collaboration**: Ministry Mapper introduces a dynamic, real-time update system, enhancing collaboration among publishers. This ensures that territory coverage is both efficient and effective, with minimal overlap between publishers engaging in different forms of ministry.

- **Uninterrupted Ministry Work**: The digital distribution and management of territories mean that ministry activities can proceed smoothly, without interruption, even in the face of unexpected challenges affecting the territory conductor.

### Embracing Ministry Mapper: What to Expect

Adopting Ministry Mapper is a forward-thinking move, but it's important to consider:

- **Initial Setup**: Transitioning your territory details to a digital format is a one-time effort that requires dedication. We provide resources and support to facilitate a smooth transition.

- **Internet Dependency**: The functionality of Ministry Mapper is reliant on internet connectivity. In areas where internet access is limited or unreliable, this could pose a challenge. Planning and preparation can help mitigate these issues.

- **Ease of Adoption**: Moving from paper to digital is a significant change, especially for those less accustomed to technology. We're committed to providing comprehensive support and training to ensure a seamless transition for all users, empowering every member of your congregation to confidently utilize Ministry Mapper.

**Important Note**: The information provided below may not be accurate due to the constant development and updates to Ministry Mapper. We strive to keep our documentation up-to-date, but given the rapid pace of change, some details may have evolved. Always refer to the latest version of our documentation or contact me for the most current information.

### Technical Overview

Ministry Mapper is a web application built using ReactJs, Typescript, and Firebase. It leverages Firebase Real-time Database for data storage and synchronization, Firebase Authentication for user management, and Firebase Functions for backend job scheduling. The application is hosted on a cloud CDN provider, ensuring fast and reliable access for users worldwide.

To enhance the security framework of Ministry Mapper, the application integrates Firebase App Check, a pivotal feature engineered to shield against malicious or unauthorized traffic. This mechanism meticulously authenticates each request, ensuring a fortified barrier that upholds the app's operational integrity. Complementing this, Ministry Mapper employs meticulously designed security rules within the Firebase Real-time Database. These rules are strategically formulated to guarantee that database interactions—whether reading, writing, or updating—are exclusively performed by authenticated users who possess the requisite permissions. This dual-layered approach not only secures data transactions but also reinforces the overall security posture of Ministry Mapper, safeguarding user data and maintaining trust.

To ensure the highest level of operational reliability, Ministry Mapper leverages Rollbar for comprehensive error tracking and monitoring. This integration not only enhances the user experience by minimizing disruptions but also provides valuable insights for continuous improvement and swift issue resolution.

For territory management, Ministry Mapper utilizes Google Maps API to display territories and facilitate efficient navigation. This feature enhances the user experience by providing a visual representation of territories and enabling users to easily locate and access specific areas.

In addition to these core technologies, Ministry Mapper integrates with MailerSend for email delivery services, enabling seamless communication with users and ensuring that important notifications and updates reach the intended recipients promptly.

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
     - VITE_GOOGLE_MAPS_API_KEY=api_key_from_google_maps
     - VITE_FIREBASE_RECAPTCHA_ENTERPRISE_SITE_KEY=site_key_from_recaptcha
     - VITE_PRIVACY_URL=privacy_policy_url
     - VITE_TERMS_URL=terms_of_service_url
     - VITE_ABOUT_URL=about_url
     - VITE_ROLLBAR_ACCESS_TOKEN=access_token_from_rollbar
     - VITE_ROLLBAR_ENVIRONMENT=local
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
     - VITE_FIREBASE_APPCHECK_DEBUG_TOKEN=token generated from appcheck
     - VITE_GOOGLE_MAPS_API_KEY=api_key_from_google_maps
     - VITE_FIREBASE_RECAPTCHA_ENTERPRISE_SITE_KEY=site_key_from_recaptcha
     - VITE_PRIVACY_URL=privacy_policy_url
     - VITE_TERMS_URL=terms_of_service_url
     - VITE_ABOUT_URL=about_url
     - VITE_ROLLBAR_ACCESS_TOKEN=access_token_from_rollbar
     - VITE_ROLLBAR_ENVIRONMENT=production
