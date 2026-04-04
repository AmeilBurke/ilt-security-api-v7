// staff.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Staff = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.staff;
  },
);