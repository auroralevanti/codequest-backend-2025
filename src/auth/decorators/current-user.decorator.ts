import { createParamDecorator, ExecutionContext, ForbiddenException, InternalServerErrorException } from "@nestjs/common";
import { ValidRoles } from "../enums/valid-roles.enum";

export const CurrentUser = createParamDecorator(
    ( roles: ValidRoles, context: ExecutionContext ) => {  
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if(!user) throw new InternalServerErrorException('No user inside the request - use AuthGuard');

        if( roles.length === 0 ) return user;

        if( roles.includes(user.roles) ) return user;

        throw new ForbiddenException(`User ${ user.username } does not have the necessary roles [${ roles }]`)
    }
);