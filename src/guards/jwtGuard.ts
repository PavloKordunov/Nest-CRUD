import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

type Status = 'User' | 'Admin';
import { JwtService } from "@nestjs/jwt";

@Injectable()

export class JwtGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
    
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Invalid token format');
      }
    
      const token = authHeader.split(' ')[1];
    
      try {
        const decoded = this.jwtService.verify(token) as { id: number; email: string; status?: Status };
     
        request.user = decoded;
        return true;
      } catch (error) {
        console.error('JWT verification error:', error.message);
        throw new UnauthorizedException('Invalid or expired token');
      }
    }
    
    
  }
