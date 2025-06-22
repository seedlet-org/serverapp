import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { SupabaseService } from 'src/supabase/supabase.service';

@Module({
  providers: [UsersService, PrismaService, SupabaseService],
  controllers: [UsersController],
})
export class UsersModule {}
