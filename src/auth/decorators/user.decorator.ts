import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';

export const ActiveUser = createParamDecorator(
  (field: keyof User | undefined, context: ExecutionContext) => {
    {
      const request = context.switchToHttp().getRequest<Request>();

      const user = request.user;
      if (!field) return user;

      const data = user?.[field];

      return data ?? null;
    }
  },
);
