import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GroupeIds, ProducerTopics, ShipmentStatus } from 'src/enums';
import { KafkaService } from 'src/services';
import { Shipment } from 'src/models';

@Injectable()
export class DeleteShipmentConsumer implements OnModuleInit {
  constructor(
    @InjectModel(Shipment.name) private shipmentModel: Model<Shipment>,
    private readonly kafkaConsumer: KafkaService,
  ) {}

  async onModuleInit() {
    this.kafkaConsumer.consume(
      GroupeIds.SHIPMENT_DELETE,
      { topic: ProducerTopics.SHIPMENT_DELETED },
      {
        eachMessage: async ({ topic, partition, message }) => {
          const shipmentId = message.value.toString();
          await this.shipmentModel.findByIdAndUpdate(shipmentId, {
            $set: { status: ShipmentStatus.DELETED },
            $push: {
              history: {
                status: ShipmentStatus.DELETED,
                Date: new Date(),
              },
            },
          });

          console.log(
            `Source: ${GroupeIds.SHIPMENT_DELETE} message: Marked shipment with ID ${shipmentId} as deleted partition: ${partition} topic: ${topic}`,
          );
        },
      },
    );
  }
}
