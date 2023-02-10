<p align="center">
<img src="https://nestjs.com/img/logo-small.svg"  width="100"  alt="Nest Logo"  />
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456

[circleci-url]: https://circleci.com/gh/nestjs/nest  

##  Description

A Todo backend application with [NestJS](https://nestjs.com/) using : 
- Docker
- TypeORM
- PostgreSQL
- PGadmin4

##  Installation

Clone the repository :
`git clone https://github.com/mcholl85/TodoMVC-NestJS.git`

Switch to the repo folder :
`cd TodoMVC-NestJS`

Install dependencies : 
`npm  install`

Create the environment file :
- docker.env
	```
	POSTGRES_USER=admin
	POSTGRES_PASSWORD=admin
	POSTGRES_DB=nestjs
	PGADMIN_DEFAULT_EMAIL=admin@admin.com
	PGADMIN_DEFAULT_PASSWORD=admin
	```
- .env
	```
	POSTGRES_HOST=localhost
	POSTGRES_PORT=5432
	POSTGRES_USER=admin
	POSTGRES_PASSWORD=admin
	POSTGRES_DB=nestjs
	PORT=5000
	```
Start the containers : 
`docker-compose up`




##  Running the app

```bash

# development

npm  run  start

  

# watch mode

npm  run  start:dev

  

# production mode

npm  run  start:prod

```
##  Test
```bash

# unit tests

npm  run  test

  

# e2e tests

npm  run  test:e2e

  

# test coverage

npm  run  test:cov

```
