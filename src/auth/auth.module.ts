import { Module } from "@nestjs/common/decorators";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategy";
//import { PrismaModule } from "src/prisma/prisma.module";
@Module({
	imports:[JwtModule.register({})],
	controllers:[AuthController],
	providers:[AuthService,JwtStrategy],
	
})
export class AuthModule{
	
}