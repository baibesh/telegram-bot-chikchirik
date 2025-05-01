import { OnQueueActive, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('template')
export class BullTemplateProcessor {
  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }
}
