Welcome to Digital AI Doctor 

The Digital AI Chatbot for Junior Doctors is a virtual medical assistant designed to provide interactive learning, case simulations, and instant guidance for medical trainees. It helps junior doctors enhance their clinical decision-making skills, reinforce medical knowledge, and practice real-world scenarios in a risk-free environment.

Demo posted on youtube : https://youtu.be/MbNVCWQfaac

🚀 How to Run the App

Prerequisites Node.js installed on your computer Expo Go app installed on your mobile device PostgreSQL installed (for local database)

Setup steps:

Clone the repository
git clone https://github.com/YOUR-USERNAME/digital-opd.git
cd digital-opd
Install dependencies
npm install
Create a local PostgreSQL database named 'opd_game'

Update the database configuration in app/config.js with your local PostgreSQL credentials

Start the development server

npm run web
Running on your phone:
->Install 'Expo Go' from your phone's app store ->Scan the QR code shown in the terminal with your phone's camera ->The app will open in Expo Go

📝 Note
This app is configured to work with a local PostgreSQL database. Users will need to set up their own database with the following configuration:

{
  user: 'postgres',
  host: 'localhost',
  database: 'opd_game',
  password: 'your_password',  // Change this
  port: 5432
}
🛠️ Built With
React Native Expo PostgreSQL Google Gemini AI WebSocket for real-time communication

The game involves identifying the right test for the patient symptoms and diagnosing the patient based on the test. The patient reveals symptoms, the senior AI doctor asks the learner what should be the next step in helping the patient. The learner has to answer in free form text. For every patient, the learner has to understand which is the best test to take for their symptoms, and post getting the test results, what’s the next best diagnosis.
