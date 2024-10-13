# Chat Application

This project is a real-time chat application developed using Firebase and React.js. Users can chat with others, send and receive messages, and view their online status.

## Features

- **Real-Time Messaging**: Messages are updated in real-time using Firebase Realtime Database.
- **User Registration and Login**: User registration and login can be done using Firebase Authentication.
- **Online Status Display**: Users' online statuses are tracked using the `lastSeen` field.
- **Mobile Compatibility**: The application is designed to be responsive across different screen sizes.

## Technologies

- **Frontend**: React.js
- **Backend**: Firebase
  - Firebase Realtime Database
  - Firebase Authentication

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/Volkanmolla42/fullStack-chat-app.git
   cd chat-app
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Create and configure your Firebase project. Set up a new project in the Firebase console and configure the necessary settings for your application.

4. Modify `src/firebase.js` file and add your Firebase configuration:

   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
   };
   ```

5. Start the application:
   ```bash
   npm run dev
   ```

## Usage

- Create a user account or log in.
- Search for other users and chat with them.
- View your online status while messaging.

## License

This project is licensed under the [MIT License](LICENSE).
