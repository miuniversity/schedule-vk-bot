import { Global, Module } from '@nestjs/common';
import { VkModule } from 'nestjs-vk';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as https from 'https';

import { AppUpdate } from './app.update';
import { UsersModule } from './users/users.module';
import { GreeterModule } from './greeter/greeter.module';
import { MenuModule } from './menu/menu.module';
import { FaqModule } from './faq/faq.module';
import { DataModule } from './data/data.module';
import { FloorMapsModule } from './floor-maps/floor-maps.module';
import { ScheduleModule } from './schedule/schedule.module';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { InfoModule } from './info/info.module';
import { ApiModule } from './api/api.module';
import { WebhookModule } from './webhook/webhook.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SettingsModule } from './settings/settings.module';
import { LecturerModule } from './lecturer/lecturer.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    VkModule.forManagers({}),
    VkModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        token: configService.get<string>('TOKEN'),
        options: {
          pollingGroupId: +configService.get<number>('GROUP_ID'),
          apiMode: 'sequential',
          language: 'ru',
          agent: new https.Agent({ keepAlive: false }),
        },
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('TYPEORM_HOST'),
        username: configService.get('TYPEORM_USER'),
        password: configService.get('TYPEORM_PASS'),
        database: configService.get('TYPEORM_DB'),
        port: configService.get('TYPEORM_PORT'),
        entities: [__dirname + 'dist/**/*.entity.{t,j}.s'],
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    ApiModule,
    UsersModule,
    GreeterModule,
    MenuModule,
    FaqModule,
    DataModule,
    FloorMapsModule,
    ScheduleModule,
    AuthModule,
    FileModule,
    InfoModule,
    SettingsModule,
    LecturerModule,
    NotificationsModule,
    WebhookModule,
  ],
  providers: [AppUpdate],
})
export class AppModule {}
