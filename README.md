
# SyncLearn - Final Year University Project
Dissertation: [https://drive.google.com/file/d/1MlrYLo99QAOAK5mxXRJsTr5XQVNpONd5/view?usp=sharing]()

#How to Run

#### How to run this project on your local machine.
1. Clone the project from here [https://github.com/MFRaja/StudyLearn]()

2. Then you need to install all the dependices that this project uses which can be done simply by entering this command
```
npm install
```
3. Then you will need to load your own environment variables inside a .env file. Add the .env file to the .gitignore file. The environment variables will be provided in the "env" file. In the case that they are not, or if DigitalOcean no longer hosts the managed database, then you can create a MySQL server with a table with 4 fields. These 4 fields are "id", "name", "email" and "password".

4. Enter this command
```
npm start
```

and then you can access the application through http://localhost:3000/ endpoint.
