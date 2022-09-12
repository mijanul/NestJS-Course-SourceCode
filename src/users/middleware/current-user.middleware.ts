import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../users.service';
import { User } from '../user.entity';

// --> for doing 'req = currentUser = user'
declare global {
  namespace Express {
    interface Request {
      currentUser?: User;
    }
  }
}
// <--

@Injectable()
export class CurrentUserMiddleWare implements NestMiddleware {
  constructor(private usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { userId } = req.session || {};

    if (userId) {
      const user = await this.usersService.findOne(userId);
      // declared global as by default req doesn't have 'currentUser' property
      req.currentUser = user;
    }

    next();
  }
}
