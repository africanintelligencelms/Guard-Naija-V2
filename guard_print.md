@/context/
@/components/AdminDashboard.tsx

@/services/firebase.ts
@/services/geminiService.ts

lets work on the admin dashboard and agency dashboard

1. implement live data fetching from my firestore into my admin dashboard
2. implement live data fetching from my firestore into my agency dashboard
analyze the admin dashboard and agency dashboard and create an implementation plan for it.






Now let's work on the signup and login for both the agency and citizen



1. implement signup and login for both the agency and citizen
2. this will allow users to be able to signup and login instead of using mock data and the logins details be saved on firebase
3. for the admin it should be just a login page and after login it should redirect to the admin dashboard  
4. also on the admin dashboard it should have  a user management section where admin can add, remove and update users and an agency management section where admin can add, remove and update agencies




Now let's work on adding the User & Agency Management to the Admin Dashboard:

1. User Management Section:
- View all users in a table
- Add/edit/delete users
- Activate/deactivate accounts
- Filter by role
2. Agency Management Section:
- View all agencies
- Approve/reject registrations
- Edit agency details
- Monitor activity
3. update the storage rules and firestore rules





Am currently deploying this on firebase, how can i load my environment variables on firebase



i add the api key to the .env on the code base so what is next




i have a couple of issues on the website
1. after reporting an incident on the citizen dashboard I don't see any indication that i reported an incident until i reload the page same goes to agency page and admin I have to reload before seeing anything
2. i created a citizen and reported an incident and  also created another  new citizen on the citizen  dashboard, at first everything was working fine but then i created another citizen and reported an incident and i saw the data of the first citizen i created instead of a fresh start for the new citizen please fix this




Hello there is an error I have been prompting you to fix but you haven't fixed it
1. After signing up a citizen and reporting an incident for let say citizen A and it reflects on his dashboard  and i logout from citizen A account i create a new citizen as citizen B and i login its supposed to show  empty entries on the active incident section since it is a new user but it shows the incident of citizen A I don't know what is wrong and i don't want t like that each citizen is suppose to have a unique entry to that citizen fix this well because you haven't done it.
2. i want you to create popup modals instead of alerts after i report an incident





Hello, on the admin dashboard i want you to make the system audit log active and working and also activate the view full log button on the admin dashboard and also make the system audit log viewable on the admin dashboard
then build and deploy  to firebase too







on the admin dashboard, on the full incident database section make the view details under action work showing the incident details and on the login form for admin make the color purple for the top side of the login form not green just for the admin login form then build and deploy to firebase using the  firebase deploy ---only hosting 





1. great also change the color of the top side of the agency login form to blue and the login button to blue
2. also what is the use of the SOS button on the citizen dashboard and if it is not functional fix it and make it functional
3. what does the system audit log section do on the admin dashboard




great now 
1. you haven't changed the color of the login and create agency account button on the agency login form to blue
2. also on the admin dashboard fix and make the system audit log active and working and also activate the view full log button on the admin dashboard and also make the system audit log viewable on the admin dashboard