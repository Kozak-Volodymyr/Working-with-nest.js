import { Injectable } from '@nestjs/common/decorators';
import { PrismaService } from 'src/prisma/prisma.service';
import {Prisma } from '@prisma/client'
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt/dist';
import { ForbiddenException } from '@nestjs/common/exceptions/forbidden.exception';
import { ConfigService } from '@nestjs/config/dist/config.service';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async singin(dto: AuthDto) {
    //find user
    const user =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

    if (!user)
      throw new ForbiddenException(
        'Credentials incorrect',
      );
    //valid password
    const pwMatches = await argon.verify(
      user.hash,
      dto.password,
    );
    if (!pwMatches) {
      throw new ForbiddenException(
        'Credentials incorrect',
      );
    }
    //send back user
    
    return this.signToken(user.id, user.email);
  }

  async singup(dto: AuthDto) {
    //generate password hash
    const hash = await argon.hash(dto.password);
    try {
      //save new user
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      return this.signToken(user.id,user.email);
    } catch (error) {
      if (
        error instanceof
        Prisma.PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Credentials taken',
          );
        }
      }
      throw error;
    }
  }

  async signToken(userId: number,email: string,): Promise<{access_token:string}> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    
	const token=await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });
	return {
		access_token:token
	}
  }
}