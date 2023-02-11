import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import UpdatePartialTodoDto from './dto/updatePartialTodo.dto';
import OrderAlreadyTakenError from './exceptions/orderAlreadyTaken.exception';
import TodoNotFoundError from './exceptions/todoNotFound.exception';
import Todo from './todos.entity';
import TodosService from './todos.service';

const oneTodo: Todo = plainToInstance(Todo, {
  id: '1',
  title: 'test',
  completed: false,
  order: 1,
});

describe('TodosService', () => {
  let service: TodosService;
  let mockedRepo;

  beforeEach(async () => {
    mockedRepo = {
      findOneBy: jest.fn((id) => Promise.resolve(oneTodo)),
      findOne: jest.fn(() => null),
      find: jest.fn((options) => Promise.resolve([oneTodo])),
      create: jest.fn(() => oneTodo),
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockReturnValueOnce({ max: 0 }),
      })),
      update: jest.fn(() => Promise.resolve()),
      save: jest.fn((todo) => Promise.resolve()),
      clear: jest.fn(() => Promise.resolve()),
      remove: jest.fn(() => Promise.resolve()),
      delete: jest.fn(() => Promise.resolve({ affected: 1 })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getRepositoryToken(Todo),
          useValue: mockedRepo,
        },
      ],
    }).compile();

    service = await module.get(TodosService);
  });

  describe('getAllTodos', () => {
    it('should return a array of Todo', async () => {
      const findSpy = jest.spyOn(mockedRepo, 'find');
      const todos = await service.getAllTodos();

      expect(todos).toEqual([
        {
          id: '1',
          title: 'test',
          completed: false,
          order: 1,
        },
      ]);
      expect(findSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('createTodo', () => {
    it('should create a new Todo', async () => {
      const createTodoSpy = jest.spyOn(mockedRepo, 'create');
      const saveSpy = jest.spyOn(mockedRepo, 'save');
      const createTodo = await service.createTodo('test');
      const todo = {
        id: '1',
        title: 'test',
        completed: false,
        order: 1,
      };

      expect(createTodo).toEqual(todo);
      expect(createTodoSpy).toBeCalledTimes(1);
      expect(createTodoSpy).toBeCalledWith({
        id: expect.any(String),
        title: 'test',
        completed: false,
        order: 1,
      });
      expect(saveSpy).toBeCalledTimes(1);
      expect(saveSpy).toBeCalledWith(todo);
    });
  });

  describe('deleteAllTodos', () => {
    it('should delete all todos', async () => {
      const clearSpy = jest.spyOn(mockedRepo, 'clear');

      await service.deleteAllTodos();
      expect(clearSpy).toBeCalledTimes(1);
    });
  });

  describe('deleteCompletedTodos', () => {
    it('should delete completed todos', async () => {
      const findSpy = jest.spyOn(mockedRepo, 'find');
      const removeSpy = jest.spyOn(mockedRepo, 'remove');

      await service.deleteCompletedTodos();

      expect(findSpy).toBeCalledTimes(1);
      expect(findSpy).toBeCalledWith({ where: { completed: true } });
      expect(removeSpy).toBeCalledTimes(1);
      expect(removeSpy).toBeCalledWith([oneTodo]);
    });
  });

  describe('getTodoById', () => {
    it('should get a Todo given the id', async () => {
      const findOneBySpy = jest.spyOn(mockedRepo, 'findOneBy');
      const todo = await service.getTodoById('1');

      expect(todo).toEqual({
        id: '1',
        title: 'test',
        completed: false,
        order: 1,
      });
      expect(findOneBySpy).toBeCalledTimes(1);
      expect(findOneBySpy).toBeCalledWith({ id: '1' });
    });
    it('should throw an not found error when the todo with the id do not exist', async () => {
      mockedRepo.findOneBy = jest.fn(() => Promise.resolve(null));

      await expect(service.getTodoById('2')).rejects.toThrow(TodoNotFoundError);
    });
  });
  describe('updateTodo', () => {
    it('should update a Todo given the updateTodo body', async () => {
      const updateSpy = jest.spyOn(mockedRepo, 'update');
      const body = {
        title: 'test',
        completed: true,
        order: 1,
      };
      await service.updateTodo('1', body);

      expect(updateSpy).toBeCalledTimes(1);
      expect(updateSpy).toBeCalledWith('1', body);
    });
    it('should update a Todo given the updatePartialTodo body', async () => {
      const updateSpy = jest.spyOn(mockedRepo, 'update');
      const body = new UpdatePartialTodoDto();

      body.title = 'edited';

      await service.updateTodo('1', body);

      expect(updateSpy).toBeCalledTimes(1);
      expect(updateSpy).toBeCalledWith('1', body);
    });
    it('should throw an error when the order is taken by another todo', async () => {
      mockedRepo.findOne = jest.fn(() => Promise.resolve(oneTodo));

      await expect(service.updateTodo('1', { order: 1 })).rejects.toThrow(
        OrderAlreadyTakenError,
      );
    });
  });

  describe('deleteTodo', () => {
    it('should delete a Todo', async () => {
      const deleteSpy = jest.spyOn(mockedRepo, 'delete');

      await service.deleteTodo('1');

      expect(deleteSpy).toBeCalledTimes(1);
      expect(deleteSpy).toBeCalledWith('1');
    });
    it('should throw an error when the id does not exist', async () => {
      mockedRepo.delete = jest.fn(() => Promise.resolve({ affected: 0 }));

      await expect(service.deleteTodo('someid')).rejects.toThrow(
        TodoNotFoundError,
      );
    });
  });
});
