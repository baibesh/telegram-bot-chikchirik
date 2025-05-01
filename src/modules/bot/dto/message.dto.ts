import { ClientDto } from './client.dto';

export class MessageDto {
  clients: ClientDto[];
  text: string;
}
