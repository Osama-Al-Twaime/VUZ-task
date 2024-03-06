import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from 'src/controllers';
import { UserSchema, User, Shipment, ShipmentSchema } from 'src/models';
import { AdminService, AuthService, MailService } from 'src/services';
import { DeleteShipmentConsumer, UpdateShipmentConsumer } from 'src/consumers';
import { CacheModule } from '@nestjs/cache-manager';
import { KafkaModule } from './kafka';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Shipment.name, schema: ShipmentSchema },
    ]),
    KafkaModule,
    CacheModule.register(),
  ],
  providers: [
    DeleteShipmentConsumer,
    UpdateShipmentConsumer,
    AdminService,
    AuthService,
    MailService,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
