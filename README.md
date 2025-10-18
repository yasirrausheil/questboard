
# QuestBoard;
QuestBoard is a gamified task and habit tracker designed for developers and professionals who want to stay productive and motivated.
Users can create daily, weekly, or onetime quests, earn xp and coins, unlock avatars and themes, and track their progress.


# Main features:
- User registration and login system
- Personal profile with avatar, stats, streaks, and badges
- Quest management - create, edit, complete
- xp, coins, and level-up system
- Shop with avatar and theme rewards
- Unit testing with Jest


# Installation Instructions
1. Download and extract the ZIP file of this project.
2. Open the folder in Visual Studio Code.
3. Install dependencies by running: npm install

# Database Setup
# for For Linux/macOS or Git Bash
Ensure MySQL Server is running
Create the database:
1. CREATE DATABASE questboard;
Import the SQL files (in this order):
2. mysql -u root -p questboard < sql/ddl.sql
3. mysql -u root -p questboard < sql/insert.sql
When running these commands, you will be asked to enter your MySQL root password.
If your setup has no password, just remove the -p

# For Windows PowerShell:
Get-Content .\ddl.sql | "C:\Program Files\MariaDB 12.0\bin\mysql.exe" -u root -p questboard
Get-Content .\insert.sql | "C:\Program Files\MariaDB 12.0\bin\mysql.exe" -u root -p questboard
If your setup has no password, just remove the -p

# Execution Instructions
1. Start the application with - node index.js
2. Then open your browser and go to - http://localhost:1337


# code test
This project uses Jest for unit testing.
To run tests  - npm test
The tests check:
* xp and level progression
* Quest completion logic and streak counters


Author: Yasir Rausheil
Course: PA1414 - INDVIDUEL PROGRAMVARU PROJEKT
University: Blekinge Tekniska Högskola