# EatRoulette-API
This is the API of the EatRoulette project

## Installation
Install the project :
```shell script
git clone https://github.com/EatRoulette/EatRoulette-API.git
cd EatRoulette-API
```

Install node modules :
```shell script
npm i
```

#### Connect your MongoDB database

For step you will need [Docker](https://www.docker.com/).
To start your MongoDB container:
```shell script
docker run -d -p "27017:27017" -e MONGO_INITDB_ROOT_USERNAME=USERNAME -e MONGO_INITDB_ROOT_PASSWORD=PASSWORD mongo
```

Create the file `.env` with the following content :
```shell script
API_PORT=#YourPORT
MONGO_URI=#YourURI
MONGO_USER=#YourUSER
MONGO_PASS=#YourPASSWORD
MONGO_AUTH_SOURCE=#YourAUTHSOURCE
```

Finally you can start the API : 
```shell script
npm start
```
