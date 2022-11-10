# budget-tracker app

A summer side project developed for personal use.\
Hosted on <https://aq-budget-track.herokuapp.com/> (No longer being updated and will be closed)\

Frontend hosted on <https://budget-tracker-albertquon.vercel.app>\
Backend hosted on fly.io <https://budget-tracker.fly.dev/>\
Sample account with data: (Username: sample, Password: C$d%7!6#)

## Features

- Create and delete budgets to set limits on spending and compare with predicted income
- Create, edit, or delete transactions that will be used to track spending in budgets
- View summaries of budgets and transactions with a chart
- User Login
- Using tokens for user authentication
- Information is saved on a database hosted on Heroku
- Website is hosted on Vercel and API is hosted on Fly.io with Postgres

## Technologies

### Frontend

- ReactJS, HTML, CSS
- React-Bootstrap for components
- React-chart-js for charts
- Formik and Yup for forms
- Axios for API requests

### Backend

- Django + Django Rest Framework for REST API
- Simple JWT for token authentication
- PostgreSQL database

### Credits

- [Authentication](https://sushil-kamble.medium.com/django-rest-framework-react-authentication-workflow-2022-part-1-a21f22b3f358)
- [Project Layout](https://towardsdev.com/django-react-app-from-scratch-to-deployment-part-1-8a2fa9a97f1)
- [Dockerfile](https://dev.to/teachmetechy/django-rest-framework-on-flyio-582p)
