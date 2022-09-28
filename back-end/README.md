# <p align = "center"> Sing me a song </p>

<p align = "center">
   <img src="https://img.shields.io/badge/author-Lucas_Lima-4dae71?style=flat-square" />
   <img src="https://img.shields.io/github/languages/count/lugablima/sing-me-a-song?color=4dae71&style=flat-square" />
</p>

<div align="center">

  <h3>Built With</h3>

  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" height="30px"/>
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" height="30px"/>  
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express.js&logoColor=white" height="30px"/>
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" height="30px"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" height="30px"/>
  <!-- Badges source: https://dev.to/envoy_/150-badges-for-github-pnk -->
</div>

##  :clipboard: Description

Sing me a song API, an application for anonymous music recommendation, built with Typescript, Node.js, Express, Prisma and Postgres.

## :computer: Features

- Create a recommendation;
- Upvote the recommendation;
- Downvote the recommendation;
- List all recommendations;
- List a recommendation by its id;
- List a random recommendation;
- List the recommendations with the highest number of points.

***

## :rocket: Routes

### Create a recommendation

```http
POST /recommendations
```

#### Request:

| Body             | Type      | Description                         |
| :----------------| :-------- | :---------------------------------- |
| `name`          | `string`  | **Required**. Song name.            |
| `youtubeLink`       | `string`  | **Required**. Music youtube link.        |

`The youtubeLink key must match the regex /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/`

#

### Upvote the recommendation

```http
POST /recommendations/:id/upvote
```

`id is the recommendation id`

#

### Downvote the recommendation

```http
POST /recommendations/:id/downvote
```

`The id parameter is the recommendation id`

#

### List all recommendations

```http
GET /recommendations
```

#### Response:

```json
[
  {
    "id": 1,
    "name": "recomendation name",
    "youtubeLink": "http://...",
    "score": 1,
  },
  {
    ...
  }
]
```

#

### List a recommendation by its id

```http
GET /recommendations/:id
```

`The id parameter is the recommendation id`

#### Response:

```json
{
  "id": 1,
  "name": "recomendation name",
  "youtubeLink": "http://...",
  "score": 1,
}
```

#

### List a random recommendation

```http
GET /recommendations/random
```

#### Response:

```json
{
  "id": 1,
  "name": "recomendation name",
  "youtubeLink": "http://...",
  "score": 1,
}
```

#

### List the recommendations with the highest number of points

```http
GET /recommendations/top/:amount
```

`The amount parameter is the quantity of recommendations to be returned (e.g. if you want the top 10 recommendations, then amount must equal 10)`

#### Response:

```json
[
  {
    "id": 1,
    "name": "recomendation name",
    "youtubeLink": "http://...",
    "score": 50,
  },
  {
    "id": 2,
    "name": "recomendation name",
    "youtubeLink": "http://...",
    "score": 40,
  },
  {
    ...
  }
]
```

***

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`PORT = number` `Recommended:5000`

`DATABASE_URL = postgres://UserName:Password@Hostname:5432/DatabaseName`

`NODE_ENV = prod`  

## 🏁 Run Locally

Clone the project

```bash
  git clone https://github.com/lugablima/sing-me-a-song
```

Go to the project directory

```bash
  cd sing-me-a-song/back-end
```

Install dependencies

```bash
  npm install
```

Create the database on your machine

```bash
  npx prisma migrate dev
```

Build the project

```bash
  npx tsc
```

Start the server

```bash
  npm start
```
