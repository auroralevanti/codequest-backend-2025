import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const CurrentUser = createParamDecorator(
    ( roles: string[] = [], context: ExecutionContext ) => {  
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if(!user) throw new InternalServerErrorException('No user inside the request - use AuthGuard');
        return user;
    }
);