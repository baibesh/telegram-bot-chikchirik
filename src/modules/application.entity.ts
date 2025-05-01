import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ApplicationEntity {
  @PrimaryGeneratedColumn()
  id: number;
}
