import {Test} from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { INestApplication } from '@nestjs/common/interfaces/nest-application.interface';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { PrismaService } from 'src/prisma/prisma.service';
import * as pactum from 'pactum'
import { AuthDto } from 'src/auth/dto';
import { CreateBookmarkDto } from 'src/bookmark/dto';
import { EditBookmarkDto } from 'src/bookmark/dto/edit-bookmark.dto';
describe('App e2e',()=>{
	let app:INestApplication;
	let prisma:PrismaService
	beforeAll(async()=>{
		const moduleRef=await Test.createTestingModule({
			imports:[AppModule]
		}).compile();
		app=moduleRef.createNestApplication()
		app.useGlobalPipes(
        new ValidationPipe({
        whitelist: true,
      }),
    );
	await app.init()
	await app.listen(3333)
	prisma=app.get(PrismaService);
	await prisma.cleanDb();
	pactum.request.setBaseUrl('http://localhost:3333')
	})
	afterAll(()=>{
		app.close()
	})
	it.todo('should pass1')
})
describe('Auth',()=>{
	describe('Signup', () => {
    const dto: AuthDto = {
      email: 'volod113@gmail.com',
      password: 'Imanuil_and_Sebast123',
    };
    it('should throw if email empty', () => {
      return pactum
        .spec()
        .post('/auth/signup')
        .withBody({ password: dto.password })
        .expectStatus(400)
        .inspect();
    });
    it('should throw if password empty', () => {
      return pactum
        .spec()
        .post('/auth/signup')
        .withBody({ email: dto.email })
        .expectStatus(400)
        .inspect();
    });

    it('should Signup', () => {
      return pactum
        .spec()
        .post('/auth/signup')
        .withBody(dto)
        .expectStatus(201)
        .inspect();
    });
  });
	describe('Signin', () => {
		it('should Signin', () => {
    const dto: AuthDto = {
      email: 'volod113@gmail.com',
      password: 'Imanuil_and_Sebast123',
    };
    return pactum
      .spec()
      .post('/auth/signin')
      .withBody(dto)
      .expectStatus(200)
      .stores('userAt','access_token');
  });});
})
describe('User', () => {
	describe('Get me', () => {
		it('should get current user',()=>{
			return pactum.spec().get('/users/me').withHeaders({
				Authorization:'Bearer $S{userAt}'
			}
			).expectStatus(200)
		})
	});
	describe('Edit user', () => {
		it('should edit user by id', () => {
      return pactum
        .spec()
        .patch('/users')
        .withBody({
          firtName:'Volod',
		  email:'volod@gail.com'
        })
        .expectStatus(200);
    });
	});
});
describe('Bookmarks', () => {
	describe('Get empty bookmarks', () => {
		it('should get bookmarks',()=>{
			return pactum.spec().get('/bookmarks').withHeaders({
				Authorization:'Bearer $S{userAt}'
			}).expectStatus(200).expectBody([])
		})
	});
	describe('Create bookmark', () => {
		const dto:CreateBookmarkDto={
			title:'freecode',
			link:'https://'
		}
		it('should create bookmark', () => {
      return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        }).withBody(dto).
        expectStatus(201)
        .stores('bookmarkId','id')
    });
	});
	describe('Get bookmarks', () => {
		it('should get bookmarks', () => {
      return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200).expectJsonLength(1);
    });
	});
	describe('Get bookmark by id', () => {
		it('should get bookmark by id', () => {
      return pactum
        .spec()
        .get('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
        .expectBodyContains('$S{bookmarkId}');
    });
	});
	describe('Edit bookmark by id', () => {
		const dto: EditBookmarkDto = {
      description:'good'
    };
		it('should edit bookmark by id', () => {
      return pactum
        .spec()
        .patch('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        }).withBody(dto)
        .expectStatus(200)
        .expectBodyContains(dto.title).expectBodyContains(dto.link).inspect();
    });
	});
	describe('Delete bookmark by id', () => {
		it('should delete bookmark by id', () => {
      return pactum
        .spec()
        .delete('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(204)
    });
	it('should be empty',()=>{
		it('should get bookmarks', () => {
      return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200).expectJsonLength(1);
    });
	});
	})
});