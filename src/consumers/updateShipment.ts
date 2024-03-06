import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GroupeIds, ProducerTopics, ShipmentStatus } from 'src/enums';
import { KafkaService } from 'src/services';
import { Shipment } from 'src/models';

@Injectable()
export class UpdateShipmentConsumer implements OnModuleInit {
  constructor(
    @InjectModel(Shipment.name) private shipmentModel: Model<Shipment>,
    private readonly kafkaConsumer: KafkaService,
  ) {}

  async onModuleInit() {
    this.kafkaConsumer.consume(
      GroupeIds.SHIPMENT_UPDATE,
      { topic: ProducerTopics.SHIPMENT_TRANSIT },
      {
        eachMessage: async ({ topic, partition, message }) => {
          const messageData = JSON.parse(message.value.toString());

          const shipment = await this.shipmentModel.findById(
            messageData.shipmentId,
          );
          if (shipment.status !== ShipmentStatus.SCHEDULED) {
            throw new BadRequestException(
              `Failed to update Shipment - reason: shipment status is ${shipment.status}`,
            );
          }
          const updateDocument: any = { ...messageData.updateOptions };

          if (messageData.updateOptions.status) {
            updateDocument.$push = {
              history: {
                status: messageData.updateOptions.status,
                date: new Date(),
              },
            };
          }

          await this.shipmentModel.findByIdAndUpdate(
            messageData.shipmentId,
            updateDocument,
            {
              new: true,
            },
          );

          console.log(
            `Source: ${GroupeIds.SHIPMENT_DELETE} message: Updated shipment with ID ${messageData.shipmentId} partition: ${partition} topic: ${topic}`,
          );
        },
      },
    );
  }
}
