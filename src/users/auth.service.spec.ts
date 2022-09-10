import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  const users: User[] = [];

  beforeEach(async () => {
    // --> Create a fake copy of the users service
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };
    // <--

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('create a new user with a salted and hashed password', async () => {
    const user = await service.signup('mijanul@mailinator.com', 'asdF@123');
    expect(user.password).not.toEqual('asdF@123');
    const [salt, storedHash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(storedHash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async (done) => {
    await service.signup('asdfg@asdff.com', 'asdF@123');
    try {
      await service.signup('asdfg@asdff.com', 'asdF@123');
    } catch (err) {
      done();
    }
  });

  it('throws  if signin is called with unused email', async (done) => {
    try {
      await service.signin('any@email.com', 'pass@123');
    } catch (err) {
      done();
    }
  });

  it('throws if an invalid password is provided', async (done) => {
    await service.signup('mail@mailinator.com', 'myPassword');
    try {
      await service.signin('mail@mailinator.com', 'hello');
    } catch (err) {
      done();
    }
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('asdf@asd.com', 'myPassword');
    const user = await service.signin('asdf@asd.com', 'myPassword');
    expect(user).toBeDefined();
  });
});
