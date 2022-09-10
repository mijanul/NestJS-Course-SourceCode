import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUserService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUserService = {
      findOne: (id) => {
        return Promise.resolve({
          id,
          email: 'asdf@asd.com',
          password: 'myPassword',
        } as User);
      },

      find: (email) => {
        return Promise.resolve([
          { id: 1, email, password: 'myPassword' } as User,
        ]);
      },

      // remove: (id) => {
      //   return Promise.resolve({
      //     id,
      //     email: 'asdf@asd.com',
      //     password: 'myPassword',
      //   } as User);
      // },

      // update: (id, attrs) => {},
    };

    fakeAuthService = {
      // signup: (email, password) => {},

      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: fakeUserService },
        { provide: AuthService, useValue: fakeAuthService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUser('asdf@asdf.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('asdf@asdf.com');
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with given id is not found', async (done) => {
    fakeUserService.findOne = () => null;
    try {
      await controller.findUser('1');
    } catch (err) {
      done();
    }
  });

  it('signin updates session object and returns users', async () => {
    const session = { userId: -10 };
    const user = await controller.signin(
      {
        email: 'any@email.com',
        password: 'myPass',
      },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
