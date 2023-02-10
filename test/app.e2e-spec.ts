import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import Todo from '../src/todos/todos.entity';

describe('Todos', () => {
  let app: INestApplication;
  let todosRepository: Repository<Todo>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.listen(3001);
    todosRepository = module.get('TodoRepository');
    await app.init();
  });
  describe('/GET /todos should return a', () => {
    beforeAll(async () => {
      await todosRepository.save(
        todosRepository.create({
          id: 'u1',
          title: 'example1',
          order: 1,
          completed: false,
        }),
      );
      await todosRepository.save(
        todosRepository.create({
          id: 'u2',
          title: 'example2',
          order: 2,
          completed: false,
        }),
      );
      await todosRepository.save(
        todosRepository.create({
          id: 'u3',
          title: 'example3',
          order: 3,
          completed: false,
        }),
      );
    });

    it('200 response', () => {
      return request(app.getHttpServer())
        .get('/todos')
        .expect(200)
        .expect(async (response) => {
          const todos = await todosRepository.find({
            where: [
              { title: 'example1' },
              { title: 'example2' },
              { title: 'example3' },
            ],
          });
          expect(response.body).toStrictEqual(
            todos.map((todo) => ({
              ...todo,
              url: `http://127.0.0.1:3001/todos/${todo.id}`,
            })),
          );
        });
    });

    afterAll(async () => await todosRepository.clear());
  });

  describe('/POST /todos should return a', () => {
    it('201 response given a title', () => {
      return request(app.getHttpServer())
        .post('/todos')
        .send({ title: 'test' })
        .expect(201)
        .expect(async (response) => {
          const todo = await todosRepository.findOneBy({
            title: 'test',
          });
          const expectedResponse = {
            ...todo,
            url: `http://127.0.0.1:3001/todos/${todo.id}`,
          };

          expect(response.body).toEqual(expectedResponse);
        });
    });
    afterAll(async () => await todosRepository.clear());
  });

  describe('/GET /todos/:id should return a', () => {
    beforeAll(async () => {
      await todosRepository.save(
        todosRepository.create({
          id: 'u1',
          title: 'test',
          order: 1,
          completed: false,
        }),
      );
    });
    it('200 response given a valid id', async () => {
      const todo = await todosRepository.findOneBy({ title: 'test' });

      return request(app.getHttpServer())
        .get(`/todos/${todo.id}`)
        .expect(200)
        .expect(async (response) => {
          const expectedResponse = {
            ...todo,
            url: `http://127.0.0.1:3001/todos/${todo.id}`,
          };
          expect(response.body).toStrictEqual(expectedResponse);
        });
    });
    it('404 response given an invalid id', async () => {
      return request(app.getHttpServer())
        .get('/todos/someid')
        .expect(404)
        .expect((response) =>
          expect(response.body).toStrictEqual({
            statusCode: 404,
            message: `Todo with id someid not found`,
          }),
        );
    });
    afterAll(async () => await todosRepository.clear());
  });

  describe('/DELETE /todos should return a', () => {
    beforeEach(async () => {
      await todosRepository.save(
        todosRepository.create({
          id: 'u1',
          title: 'test',
          order: 1,
          completed: false,
        }),
      );
    });
    it('204 "No Content" response', () => {
      return request(app.getHttpServer())
        .delete('/todos')
        .expect(204)
        .expect((response) => expect(response.body).toStrictEqual({}));
    });
    it('204 "No Content" response given the query parameter completed ', () => {
      return request(app.getHttpServer())
        .delete('/todos?completed=true')
        .expect(204)
        .expect((response) => expect(response.body).toStrictEqual({}));
    });
    afterAll(async () => await todosRepository.clear());
  });

  describe('/DELETE /todos/:id should return a', () => {
    beforeAll(async () => {
      await todosRepository.save(
        todosRepository.create({
          id: 'u1',
          title: 'test',
          order: 1,
          completed: false,
        }),
      );
    });
    it('204 "No Content" response', async () => {
      return request(app.getHttpServer())
        .delete('/todos/u1')
        .expect(204)
        .expect((response) => expect(response.body).toStrictEqual({}));
    });
    it('404 "Not Found" response', async () => {
      return request(app.getHttpServer())
        .delete('/todos/someid')
        .expect(404)
        .expect((response) =>
          expect(response.body).toStrictEqual({
            statusCode: 404,
            message: 'Todo with id someid not found',
          }),
        );
    });
    afterAll(async () => await todosRepository.clear());
  });

  describe('/PUT /todos/:id should return a', () => {
    beforeAll(async () => {
      await todosRepository.save(
        todosRepository.create({
          id: 'u1',
          title: 'example4',
          order: 1,
          completed: false,
        }),
      );
      await todosRepository.save(
        todosRepository.create({
          id: 'u2',
          title: 'example5',
          order: 2,
          completed: false,
        }),
      );
    });
    it('200 response', async () => {
      return request(app.getHttpServer())
        .put('/todos/u1')
        .send({ title: 'edited', completed: true, order: 100 })
        .expect(200)
        .expect((response) => {
          expect(response.body).toStrictEqual({
            id: 'u1',
            title: 'edited',
            completed: true,
            order: 100,
            url: `http://127.0.0.1:3001/todos/u1`,
          });
        });
    });
    it('404 "Not Found" response given an invalid Id', async () => {
      return request(app.getHttpServer())
        .put('/todos/someid')
        .send({ title: 'edited', completed: true, order: 3 })
        .expect(404)
        .expect((response) =>
          expect(response.body).toStrictEqual({
            statusCode: 404,
            message: 'Todo with id someid not found',
          }),
        );
    });
    it('409 "Conflict" response given an order already assigned', async () => {
      return request(app.getHttpServer())
        .put('/todos/u2')
        .send({ title: 'edited', completed: true, order: 100 })
        .expect(409)
        .expect((response) =>
          expect(response.body).toStrictEqual({
            statusCode: 409,
            message: 'Order 100 is already taken',
          }),
        );
    });
    afterAll(async () => await todosRepository.clear());
  });

  describe('/PATCH /todos/:id should return a', () => {
    beforeAll(async () => {
      await todosRepository.save(
        todosRepository.create({
          id: 'u1',
          title: 'example6',
          order: 1,
          completed: false,
        }),
      );
      await todosRepository.save(
        todosRepository.create({
          id: 'u2',
          title: 'example7',
          order: 2,
          completed: false,
        }),
      );
    });
    it('200 response', async () => {
      return request(app.getHttpServer())
        .patch('/todos/u1')
        .send({ order: 100 })
        .expect(200)
        .expect((response) => {
          expect(response.body).toStrictEqual({
            id: 'u1',
            title: 'example6',
            completed: false,
            order: 100,
            url: 'http://127.0.0.1:3001/todos/u1',
          });
        });
    });
    it('404 "Not Found" response given an invalid Id', async () => {
      return request(app.getHttpServer())
        .patch('/todos/someid')
        .send({ title: 'edited', completed: true, order: 3 })
        .expect(404)
        .expect((response) =>
          expect(response.body).toStrictEqual({
            statusCode: 404,
            message: 'Todo with id someid not found',
          }),
        );
    });
    it('409 "Conflict" response given an order already assigned', async () => {
      return request(app.getHttpServer())
        .patch('/todos/u2')
        .send({ order: 100 })
        .expect(409)
        .expect((response) =>
          expect(response.body).toStrictEqual({
            statusCode: 409,
            message: 'Order 100 is already taken',
          }),
        );
    });
    afterAll(async () => await todosRepository.clear());
  });

  afterAll(async () => {
    await app.close();
  });
});
