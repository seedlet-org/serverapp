import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';
import { HttpModule } from '@nestjs/axios';
import { SupabaseService } from './supabase/supabase.service';
import { IdeaModule } from './idea/idea.module';
import { CommentModule } from './comment/comment.module';
import { TagModule } from './tag/tag.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 5000,
          blockDuration: 10000,
          limit: 5,
        },
      ],
    }),
    RedisModule,
    UsersModule,
    AuthModule,
    EmailModule,
    HttpModule,
    IdeaModule,
    CommentModule,
    TagModule,
    EventsModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    EmailService,
    SupabaseService,
  ],
})
export class AppModule {}
