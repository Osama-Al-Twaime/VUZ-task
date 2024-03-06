import { Module } from '@nestjs/common';
import { KafkaService } from 'src/services';

@Module({
  providers: [KafkaService],
  exports: [KafkaService],
  imports: [],
})
export class KafkaModule {}
